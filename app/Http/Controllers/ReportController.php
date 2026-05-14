<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'status' => ['nullable', 'in:done,pending'],
        ]);

        $query = Activity::with(['logs.user', 'creator'])->latest('activity_date');

        if (!empty($validated['from'])) {
            $query->whereDate('activity_date', '>=', $validated['from']);
        }

        if (!empty($validated['to'])) {
            $query->whereDate('activity_date', '<=', $validated['to']);
        }

        if (!empty($validated['status'])) {
            $query->whereHas('logs', fn($q) => $q->where('status', $validated['status']));
        }

        $activities = (isset($validated['from']) || isset($validated['to']))
            ? $query->get()
            : collect();

        return Inertia::render('reports/index', [
            'activities' => $activities,
            'filters' => $validated,
        ]);
    }
}
