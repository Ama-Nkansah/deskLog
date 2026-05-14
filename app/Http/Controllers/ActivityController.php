<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Activity::with(['logs.user', 'creator'])->latest('activity_date');

        if ($request->filled('date')) {
            $query->whereDate('activity_date', $request->date);
        }

        return Inertia::render('activities/index', [
            'activities' => $query->get(),
            'filters' => $request->only('date'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('activities/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'activity_date' => ['required', 'date'],
        ]);

        Activity::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('activities.index')->with('success', 'Activity created.');
    }

    public function show(Activity $activity): Response
    {
        $activity->load(['logs.user', 'creator']);

        return Inertia::render('activities/show', [
            'activity' => $activity,
        ]);
    }
}
