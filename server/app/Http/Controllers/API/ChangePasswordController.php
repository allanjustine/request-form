<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use app\Models\User;
use Illuminate\Support\Facades\Auth;

class ChangePasswordController extends Controller
{

    public function changePassword(Request $request, $id)
{
    // Find the user by id
    $user = User::find($id);
    if (!$user) {
        return response()->json(['error' => 'User not found.'], 404);
    }

    // Validate request data
    $request->validate([
        'current_password' => 'required',
        'new_password' => 'required|string|min:5|confirmed',
    ]);

    // Verify if the current password matches the user's password in the database
    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json(['error' => 'Current password is incorrect.'], 422);
    }

    // Update the user's password
    $user->password = Hash::make($request->new_password);
    $user->save();

    Auth::guard('web')->login($user);

    return response()->json(['success' => 'Password changed successfully.'], 200);
}
}
