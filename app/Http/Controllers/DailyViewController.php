<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DailyViewController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->input('date', today()->toDateString());

        $activities = Activity::with(['logs.user', 'creator'])
            ->whereDate('activity_date', $date)
            ->latest()
            ->get();

        return Inertia::render('daily-view/index', [
            'activities' => $activities,
            'date' => $date,
        ]);
    }
}
