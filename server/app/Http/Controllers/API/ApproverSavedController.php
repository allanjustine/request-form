<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ApprovedBy;
use App\Models\NotedBy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApproverSavedController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $userId = Auth::id();
        $approvedByIds = $request->approvedByIds;
        $notedByIds = $request->notedByIds;

        ApprovedBy::where("user_id", $userId)->delete();
        NotedBy::where('user_id', $userId)->delete();

        foreach ($approvedByIds as $index => $id) {
            ApprovedBy::create([
                "user_id"       => $userId,
                'approved_by'   => $id,
                'level'         => $index + 1,
            ]);
        }

        foreach ($notedByIds as $index => $id) {
            NotedBy::create([
                "user_id"    => $userId,
                'noted_by'   => $id,
                'level'      => $index + 1,
            ]);
        }

        return response()->json([
            'message' => "successs"
        ], 204);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
