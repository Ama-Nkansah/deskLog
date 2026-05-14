<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_add_log(): void
    {
        $activity = Activity::factory()->create();

        $response = $this->post(route('activity-logs.store', $activity), [
            'status' => 'done',
            'remark' => 'Completed successfully',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_staff_can_add_log_to_activity(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $activity = Activity::factory()->create();

        $response = $this->actingAs($staff)->post(route('activity-logs.store', $activity), [
            'status' => 'done',
            'remark' => 'All clear',
        ]);

        $response->assertRedirect(route('activities.show', $activity));
        $this->assertDatabaseHas('activity_logs', [
            'activity_id' => $activity->id,
            'updated_by' => $staff->id,
            'status' => 'done',
            'remark' => 'All clear',
        ]);
    }

    public function test_admin_can_add_log_to_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $activity = Activity::factory()->create();

        $response = $this->actingAs($admin)->post(route('activity-logs.store', $activity), [
            'status' => 'pending',
            'remark' => 'Still in progress',
        ]);

        $response->assertRedirect(route('activities.show', $activity));
        $this->assertDatabaseHas('activity_logs', [
            'activity_id' => $activity->id,
            'updated_by' => $admin->id,
            'status' => 'pending',
        ]);
    }

    public function test_log_requires_status_and_remark(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $activity = Activity::factory()->create();

        $response = $this->actingAs($staff)->post(route('activity-logs.store', $activity), []);

        $response->assertSessionHasErrors(['status', 'remark']);
    }
}
