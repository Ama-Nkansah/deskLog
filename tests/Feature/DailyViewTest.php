<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailyViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_daily_view(): void
    {
        $response = $this->get(route('daily-view.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_daily_view(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('daily-view.index'));

        $response->assertOk();
    }

    public function test_daily_view_defaults_to_today(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('daily-view.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('daily-view/index')
            ->where('date', today()->toDateString())
        );
    }
}
