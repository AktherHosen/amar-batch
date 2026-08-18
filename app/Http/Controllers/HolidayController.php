<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HolidayController extends Controller
{
    public function index(Request $request)
    {
        $holidays = Holiday::when($request->year, function ($query, $year) {
                $query->whereYear('start_date', $year);
            })
            ->when($request->month, function ($query, $month) {
                $query->whereMonth('start_date', $month);
            })
            ->orderBy('start_date')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('holidays/index', [
            'holidays' => $holidays,
            'filters' => $request->only(['year', 'month']),
        ]);
    }

    public function create()
    {
        return Inertia::render('holidays/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|in:holiday,exam,other',
        ]);

        $validated['tenant_id'] = $request->user()->tenant_id;

        Holiday::create($validated);

        return redirect()->route('holidays.index')
            ->with('success', 'Holiday created successfully');
    }

    public function show(Holiday $holiday)
    {
        return Inertia::render('holidays/show', [
            'holiday' => $holiday,
        ]);
    }

    public function edit(Holiday $holiday)
    {
        return Inertia::render('holidays/edit', [
            'holiday' => $holiday,
        ]);
    }

    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|in:holiday,exam,other',
        ]);

        $holiday->update($validated);

        return redirect()->route('holidays.index')
            ->with('success', 'Holiday updated successfully');
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return redirect()->route('holidays.index')
            ->with('success', 'Holiday deleted successfully');
    }

    public function checkDate(Request $request)
    {
        $date = $request->input('date');
        $isHoliday = Holiday::forDate($date)->exists();

        return response()->json([
            'is_holiday' => $isHoliday,
            'holiday' => $isHoliday ? Holiday::forDate($date)->first() : null,
        ]);
    }

    public function import(Request $request)
    {
        $rows = $request->input('rows', []);

        foreach ($rows as $row) {
            Holiday::create([
                'title' => $row['title'] ?? '',
                'description' => $row['description'] ?? null,
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date'],
                'type' => $row['type'] ?? 'holiday',
                'tenant_id' => $request->user()->tenant_id,
            ]);
        }

        return redirect()->route('holidays.index')
            ->with('success', count($rows) . ' holidays imported successfully');
    }
}
