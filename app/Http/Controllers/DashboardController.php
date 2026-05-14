<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $activities = Activity::with(['logs.user', 'creator'])
            ->whereDate('activity_date', today())
            ->latest()
            ->get();

        return Inertia::render('dashboard', [
            'activities' => $activities,
            'date' => today()->toDateString(),
        ]);
    }
}
