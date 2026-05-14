<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_view_activities(): void
    {
        $response = $this->get(route('activities.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_activity_list(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('activities.index'));

        $response->assertOk();
    }

    public function test_admin_can_see_create_form(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('activities.create'));

        $response->assertOk();
    }

    public function test_staff_cannot_see_create_form(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($staff)->get(route('activities.create'));

        $response->assertStatus(403);
    }

    public function test_admin_can_create_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('activities.store'), [
            'title' => 'Daily SMS count vs logs',
            'description' => 'Compare SMS count from dashboard with logs',
            'activity_date' => today()->toDateString(),
        ]);

        $response->assertRedirect(route('activities.index'));
        $this->assertDatabaseHas('activities', [
            'title' => 'Daily SMS count vs logs',
            'created_by' => $admin->id,
        ]);
    }

    public function test_staff_cannot_create_activity(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($staff)->post(route('activities.store'), [
            'title' => 'Unauthorized activity',
            'activity_date' => today()->toDateString(),
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('activities', ['title' => 'Unauthorized activity']);
    }

    public function test_authenticated_user_can_view_single_activity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $activity = Activity::factory()->create(['created_by' => $admin->id]);

        $staff = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($staff)->get(route('activities.show', $activity));

        $response->assertOk();
    }
}
