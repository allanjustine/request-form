<?php

use App\Http\Controllers\API\ApproverSavedController;
use App\Http\Controllers\API\BranchController;
use App\Http\Controllers\API\BranchHeadController;
use App\Http\Controllers\API\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\LoginController;
use App\Http\Controllers\API\ForgotPasswordController;
use App\Http\Controllers\API\ResetPasswordController;
use App\Http\Controllers\API\RequestFormController;
use App\Http\Controllers\API\ChangePasswordController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\CustomApproversController;
use App\Http\Controllers\API\ApproverController;
use App\Http\Controllers\API\AreaManagerController;
use App\Http\Controllers\API\ApprovalProcessController;
use App\Http\Controllers\API\AttachmentController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\PositionController;
use App\Http\Controllers\Test\PusherController;
use Illuminate\Support\Facades\Auth;

Route::get('edit-branch/{branch_id}', function ($branch_id) {
    return "Editing branch with ID: $branch_id";
});

// PUBLIC
Route::post("register", [RegisterController::class, "register"]);
Route::post("login", [LoginController::class, "login"]);
Route::get("get-role/{id}", [UserController::class, "getRole"])->name("get.user.role");
Route::post("password/email", [UserController::class, "sendResetLinkEmail"])->name("password.forgot");
Route::get("view-branch", [BranchController::class, "viewBranch"])->name('view.branch');
Route::get('/positions', [PositionController::class, 'index']);

// PROTECTED
// REQUEST FORM
Route::middleware('auth:sanctum')->group(function () {
    Route::post("create-request", [RequestFormController::class, "createRequest"])->name('create.request');
    Route::get("view-user/{id}", [UserController::class, "viewUser"])->name('view.user');
    Route::get('/profile', [ProfileController::class, 'profile']);
    Route::get('request-forms/for-approval/{user_id}', [ApprovalProcessController::class, 'getRequestFormsForApproval'])->name('get.request.form.for.approval');

    Route::post("update-request/{id}", [RequestFormController::class, "updateRequest"])->name('update.request');
    Route::put('change-password/{id}', [ChangePasswordController::class, 'changePassword'])->name('change.password');

    Route::get("view-users", [UserController::class, "viewAllUsers"])->name('view.users');
    Route::post('verified-user/{id}', [UserController::class, 'verifiedUser']);
    Route::post("update-profile/{id}", [UserController::class, "updateProfile"])->name('update.profile');
    Route::post("update-profilepic/{id}", [UserController::class, "updateProfilePic"])->name('update.profile');
    Route::put("update-role", [UserController::class, "updateRole"])->name('update.role');
    Route::put("update-role/{id}", [UserController::class, "updateRole"])->name('update.role');
    Route::delete("delete-user/{id}", [UserController::class, "deleteUser"])->name('delete.user');
    Route::post("password/reset", [UserController::class, "reset"])->name("password.reset");
    Route::post("update-signature/{id}", [UserController::class, "updateSignature"])->name('update.signature');
    Route::delete("delete-approver/{id}", [ApproverController::class, "deleteApprover"])->name('delete-approver');
    Route::middleware('auth')->get('/view-request', [RequestFormController::class, 'index']);
    Route::middleware('auth')->get('/view-requests', [RequestFormController::class, 'viewAllRequests']);
    Route::get("total-request-sent/{user_id}", [RequestFormController::class, "totalRequestSent"])->name('total.request.sent.by.user');
    Route::delete("delete-request/{id}", [RequestFormController::class, "deleteRequest"])->name('delete.request');

    // APPROVERS
    Route::post('/approvers', [CustomApproversController::class, 'createApprovers']);
    Route::get('/custom-approvers/{user_id}', [CustomApproversController::class, 'viewCustomApproversByUser']);
    Route::get('/custom-approvers', [CustomApproversController::class, 'show']);
    Route::get('/custom-approversID/{id}', [CustomApproversController::class, 'getCustomApproverById']);
    Route::delete("delete-custom-approvers/{id}", [CustomApproversController::class, "deleteCustomApprovers"])->name('delete.approvers');
    Route::post("update-approvers/{id}", [CustomApproversController::class, "updateApprovers"])->name('update.approvers');

    // Setup Branch
    Route::post("add-branch", [BranchController::class, "createBranch"])->name('create.branch');

    Route::get("view-branch/{id}", [BranchController::class, "viewBranch"])->name('view.branch');
    Route::post("update-branch/{id}", [BranchController::class, "updateBranch"])->name('update.branch');
    Route::delete("delete-branch/{id}", [BranchController::class, "deleteBranch"])->name('delete.branch');


    Route::post("create-approvers", [CustomApproversController::class, "createApprovers"])->name('create.approvers');
    Route::get('/view-approvers/{userID}', [ApproverController::class, 'getApprovers'])->name('get.approvers.with.same.branch.and.all.HO');
    Route::get('/approvers/{id}', [ApproverController::class, 'show']);

    Route::get('/view-approvers', [ApproverController::class, 'index']);
    Route::get('/getStaff', [ApproverController::class, 'getStaff']);
    Route::get('/getAVP', [ApproverController::class, 'getAVP']);
    Route::get("get-avpstaff-branch", [ApproverController::class, "getAVPFinanceStaffs"])->name('get.avp.finance.staff');
    Route::get("get-avpstaff-branch/{id}", [ApproverController::class, "getAVPFinanceStaff"])->name('get.avp.finance.staff');
    Route::put("update-avpstaff-branch/{id}", [ApproverController::class, "updateAVPFinanceStaff"])->name('update.avp.finance.staff');
    Route::delete("delete-avpstaff-branch/{id}", [ApproverController::class, "deleteAVPFinanceStaff"])->name('delete.avp.finance.staff');


    // AREA MANAGER
    Route::post("create-area-manager", [AreaManagerController::class, "createAreaManager"])->name('create.area.manager');
    Route::post("update-area-manager/{id}", [AreaManagerController::class, "updateAreaManager"])->name('update.area.manager');
    Route::get("view-area-manager/{id}", [AreaManagerController::class, "viewAreaManager"])->name('view.area.manager');
    Route::get("view-area-managers", [AreaManagerController::class, "viewAllAreaManagers"])->name('view.area.managers');
    Route::delete("delete-area-manager/{id}", [AreaManagerController::class, "deleteAreaManager"])->name('delete.area.manager');

    // BRANCH HEAD
    Route::post("create-branch-head", [BranchHeadController::class, "createbranchhead"])->name('create.branch.head');
    Route::post("update-branch-head/{id}", [BranchHeadController::class, "updatebranchhead"])->name('update.branch.head');
    Route::get("view-branch-head/{id}", [BranchHeadController::class, "viewbranchhead"])->name('view.branch.head');
    Route::get("view-branch-heads", [BranchHeadController::class, "viewAllbranchheads"])->name('view.branch.heads');
    Route::delete("delete-branch-head/{id}", [BranchHeadController::class, "deletebranchhead"])->name('delete.branch.head');

    // APPROVAL PROCESS
    Route::post("request-forms/{request_form_id}/process", [ApprovalProcessController::class, 'processRequestForm'])->name('process.request.form'); //APPROVAL PROCESS

    Route::get('request-forms/{request_form_id}', [ApprovalProcessController::class, 'viewSingleRequestForm'])->name('view.single.request.form.for.approval');
    Route::post("add-avpstaff", [ApproverController::class, "createAVPFinance"])->name('create.avp.finance.staff');
    Route::post("add-avpstaff-branch", [ApproverController::class, "createAVPFinanceStaff"])->name('create.avp.finance..branch');

    // Attachment
    Route::post('/attachments', [AttachmentController::class, 'store']);
    Route::post("attachments/upload/{requestFormId}", [RequestFormController::class, "uploadAttachments"])->name('upload.attachments');

    // NOTIFICATION
    Route::get('notifications/{id}/all', [NotificationController::class, 'getAllNotifications'])->name('get.all.notification');
    Route::get('notifications/{id}', [NotificationController::class, 'getNotifications'])->name('get.notification');
    Route::get('notifications/{id}/unread', [NotificationController::class, 'getUnreadNotifications'])->name('get.unread.notification');
    Route::put('notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('get.mark.as.read.notification');
    Route::get('notifications/{id}/count-unread-notification', [NotificationController::class, 'countUnreadNotifications'])->name('count.unread.notification');
    Route::put('notifications/mark-all-as-read/{userId}', [NotificationController::class, 'markAllAsRead'])->name('get.mark.all.as.read.notification');
    Route::post('/read-notification/{id}', [NotificationController::class, 'markAsReadNotification']);

    // POSITION

    Route::post('/create-position', [PositionController::class, 'store']);
    Route::put('/update-position/{id}', [PositionController::class, 'update']);
    Route::delete('/delete-position/{id}', [PositionController::class, 'destroy']);

    Route::post('/logout', function (Request $request) {
        Auth::guard("web")->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully',
        ], 204);
    });

    Route::post('/save-approved-noted-by', [ApproverSavedController::class, 'store']);
});
