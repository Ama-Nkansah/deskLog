<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_reports(): void
    {
        $response = $this->get(route('reports.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_reports(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('reports.index'));

        $response->assertOk();
    }

    public function test_reports_filter_by_date_range(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $inside = Activity::factory()->create([
            'activity_date' => '2025-05-10',
            'created_by' => $admin->id,
        ]);

        $outside = Activity::factory()->create([
            'activity_date' => '2025-04-01',
            'created_by' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get(route('reports.index', [
            'from' => '2025-05-01',
            'to' => '2025-05-31',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('activities', 1)
            ->where('activities.0.id', $inside->id)
        );
    }

    public function test_reports_filter_by_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $staff = User::factory()->create(['role' => 'staff']);

        $doneActivity = Activity::factory()->create([
            'activity_date' => '2025-05-10',
            'created_by' => $admin->id,
        ]);

        ActivityLog::create([
            'activity_id' => $doneActivity->id,
            'status' => 'done',
            'remark' => 'Completed',
            'updated_by' => $staff->id,
        ]);

        $pendingActivity = Activity::factory()->create([
            'activity_date' => '2025-05-10',
            'created_by' => $admin->id,
        ]);

        ActivityLog::create([
            'activity_id' => $pendingActivity->id,
            'status' => 'pending',
            'remark' => 'Still going',
            'updated_by' => $staff->id,
        ]);

        $response = $this->actingAs($admin)->get(route('reports.index', [
            'from' => '2025-05-01',
            'to' => '2025-05-31',
            'status' => 'done',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('activities', 1)
            ->where('activities.0.id', $doneActivity->id)
        );
    }
}
