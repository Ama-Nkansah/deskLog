<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function store(Request $request, Activity $activity): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:done,pending'],
            'remark' => ['required', 'string', 'max:1000'],
        ]);

        $activity->logs()->create([
            ...$validated,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('activities.show', $activity)->with('success', 'Status updated.');
    }
}
