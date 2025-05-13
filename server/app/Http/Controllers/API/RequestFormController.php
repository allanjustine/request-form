<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CustomApprovers;
use App\Models\ApprovalProcess;
use Illuminate\Http\Request;
use App\Models\RequestForm;
use App\Models\User;
use App\Models\Attachment;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Notifications\ApprovalProcessNotification;
use App\Events\NotificationEvent;
use App\Models\AVPFinanceStaff;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Branch;

class RequestFormController extends Controller
{

    //CREATE REQUEST
    public function createRequest(Request $request)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'form_type' => 'required|string',
                'form_data' => 'required|string', // Temporarily string for decoding
                'noted_by' => 'string',
                'currency' => 'required_if:form_type,Cash Disbursement Requisition Slip|string|in:PHP,USD,EUR',
                'approved_by' => 'required|string',
                'attachment.*' => 'file|mimes:webp,pdf,png,jpg,jpeg,doc,docx,xls,xlsx,ppt,pptx,bmp,txt,zip,gif,ico',
            ]);

            $userID = $validated['user_id'];
            $formType = $validated['form_type'];
            $formDataArray = json_decode($validated['form_data'], true);
            $notedByIds = !empty(json_decode($validated['noted_by'], true)) ? json_decode($validated['noted_by'], true) : null;
            $approvedByIds = json_decode($validated['approved_by'], true);
            $currency = $request->currency;

            /*    $formDataArray = $validated['form_data'];
               $notedByIds = $validated['noted_by'];
               $approvedByIds = $validated['approved_by']; */

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'message' => 'Invalid JSON format in input data',
                ], 400);
            }

            $user = DB::table('users')->where('id', $userID)->first();
            if (!$user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);
            }
            $branchCode = $user->branch_code;


            // Define form-specific validation rules
            $validationRules = [
                'Application For Cash Advance' => [
                    "date" => 'required|date',
                    "department" => 'required',
                    "amount" => 'required|numeric',
                    "liquidation_date" => 'required|date',
                    "usage" => 'required',
                    "items" => [
                        "date" => 'required|date',
                        'day' => 'required',
                        'from' => 'required',
                        'to' => 'required',
                        'activity' => 'required',
                        'hotel' => 'required',
                        'rate' => 'required|numeric',
                        'per_diem' => 'required',
                        'remarks' => 'required',
                    ],
                    'boat_fare' => 'required|numeric',
                    'hotel_amount' => 'required|numeric',
                    'per_diem_amount' => 'required|numeric',
                    'fare' => 'required|numeric',
                    'contingency' => 'required',
                ],
                'Cash Disbursement Requisition Slip' => [
                    'date' => 'required|date',
                    //'branch' => 'required',
                    'items' => [
                        'quantity' => 'required|numeric',
                        'description' => 'required',
                        'unit_cost' => 'required|numeric',
                        'total_amount' => 'required|numeric',
                        'usage' => 'required',
                    ]
                ],
                'Liquidation of Actual Expense' => [
                    'date' => 'required|date',
                    'purpose' => 'required',
                    'items' => [
                        'date' => 'required|date',
                        'from' => 'required',
                        'to' => 'required',
                        'transportation_type' => 'required',
                        'amount' => 'required|numeric',
                        'hotel_name' => 'required',
                        'place' => 'required',
                        'per_diem' => 'required',
                        'particulars' => 'required',
                    ]
                ],
                'Purchase Order Requisition Slip' => [
                    'date' => 'required|date',
                    //'branch' => 'required',
                    'supplier' => 'required',
                    'address' => 'required',
                    "items" => [
                        'quantity' => 'required|numeric',
                        'description' => 'required',
                        'unit_cost' => 'required|numeric',
                        'total_amount' => 'required|numeric',
                        'usage' => 'required',
                    ]
                ],
                'Refund Request' => [
                    //'branch' => 'required',
                    'date' => 'required|date',
                    "items" => [
                        'quantity' => 'required|numeric',
                        'description' => 'required',
                        'unit_cost' => 'required|numeric',
                        'total_amount' => 'required|numeric',
                        'usage' => 'required',
                    ]
                ],
                'Stock Requisition Slip' => [
                    'purpose' => 'required',
                    //'branch' => 'required',
                    'date' => 'required|date',
                    "items" => [
                        'quantity' => 'required|numeric',
                        'description' => 'required',
                        'unit_cost' => 'required|numeric',
                        'total_amount' => 'required|numeric',
                        'usage' => 'required',
                    ]
                ],
                'Discount Requisition Form' => [
                    'employement_status' => 'required',
                    //'branch' => 'required',
                    'date' => 'required|date',

                    "items" => [
                        'brand' => 'required|numeric',
                        'model' => 'required',
                        'unit' => 'required',
                        'partno' => 'required|numeric',
                        'labor' => 'required',
                        'spotcash' => 'required',
                        'discountedPrice' => 'required',
                    ],
                    'total_labor' => 'required|numeric',
                    'total_spotcash' => 'required|numeric',
                    'total_discount' => 'required|numeric',
                ],
            ];

            if (!isset($validationRules[$formType])) {
                return response()->json([
                    'message' => 'Invalid form type',
                ], 400);
            }

            // Begin transaction
            DB::beginTransaction();

            // Validate form data against rules
            $encodedFormData = [];
            foreach ($formDataArray as $key => $formData) {
                if ($key !== 'items') {
                    $encodedFormData[$key] = $formData;
                    continue;
                }

                $items = [];
                foreach ($formData as $item) {
                    $validator = Validator::make($item, $validationRules[$formType]['items']);
                    if ($validator->fails()) {
                        DB::rollBack();
                        return response()->json([
                            'errors' => $validator->errors(),
                        ], 400);
                    }
                    $items[] = $item;
                }

                $encodedFormData['items'] = $items;
            }

            // Handle file uploads
            $filePaths = [];
            if ($request->hasFile('attachment')) {
                $files = is_array($request->file('attachment')) ? $request->file('attachment') : [$request->file('attachment')];

                foreach ($files as $file) {
                    // change to d_drive if using trunas
                    $filePath = $file->store('request_form_attachments', 'public');
                    if (!$filePath) {
                        DB::rollBack();
                        return response()->json([
                            'message' => 'File upload failed',
                        ], 500);
                    }
                    $filePaths[] = $filePath;
                }
            }

            $uniqueCode = $this->generateUniqueCode($formType, $branchCode);

            // Create the request form
            $requestFormData = RequestForm::create([
                'user_id' => $userID,
                'form_type' => $formType,
                'form_data' => $encodedFormData, // Ensure it's JSON encoded,
                'currency' => $currency,
                'noted_by' => $notedByIds,
                'approved_by' => $approvedByIds, // Ensure it's JSON encoded
                'attachment' => json_encode($filePaths), // Ensure it's JSON encoded
                'request_code' => $uniqueCode,
                'branch_code' => $branchCode,
            ]);

            // Helper function to handle AVPFinance users and their staff
            function handleAvpFinanceApproval($userId, &$approvalProcesses, &$level, $requestFormData, $branchId)
            {
                // if (!$requestFormData) {
                //     Log::error("Invalid RequestForm data passed to handleAvpFinanceApproval.");
                //     return;
                // }
                // Check if the user is an AVPFinance
                $user = DB::table('users')->where('id', $userId)->first();
                if ($user && $user->position === 'AVP - Finance') {
                    // Fetch AVPFinance staff
                    $avpFinanceRecord = DB::table('a_v_p_finance_staff')->where('user_id', $userId)->first();
                    if ($avpFinanceRecord) {
                        $avpStaffs = $avpFinanceRecord->staff_id;


                        // Fetch staff's branch assignments
                        $staffBranchAssignments = DB::table('a_v_p_finance_staff')
                            ->where('staff_id', $avpStaffs)
                            ->pluck('branch_id')
                            ->first();

                        if ($staffBranchAssignments) {
                            $staffBranches = json_decode($staffBranchAssignments, true); // Decode branch_id JSON
                            // Check if the staff's branches include the request form branch
                            if (in_array($branchId, $staffBranches)) {
                                $approvalProcesses[] = [
                                    'user_id' => $avpStaffs,
                                    'request_form_id' => $requestFormData->id,
                                    'level' => $level,
                                    'status' => 'Pending',
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ];
                                $level++;
                            }
                        }
                    }
                }

                // Add the AVPFinance user to the approval process


                $approvalProcesses[] = [
                    'user_id' => $userId,
                    'request_form_id' => $requestFormData->id,
                    'level' => $level,
                    'status' => 'Pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $level++;
            }

            // Initialize approval process variables
            $level = 1;
            $approvalProcesses = [];

            // Combine noted_by and approved_by into one array with labels
            if ($notedByIds !== null) {
                $approvers = [
                    ['type' => 'noted_by', 'ids' => $notedByIds],
                    ['type' => 'approved_by', 'ids' => $approvedByIds]
                ];
            } else {
            $approvers = [
                ['type' => 'approved_by', 'ids' => $approvedByIds]
            ];
            }

            // Process each approver (noted_by and approved_by)
            foreach ($approvers as $approverGroup) {
                foreach ($approverGroup['ids'] as $approverId) {
                    // Use the helper function to handle AVPFinance and their staff
                    handleAvpFinanceApproval($approverId, $approvalProcesses, $level, $requestFormData, $branchCode);
                }
            }

            // Insert all approval processes into the database
            ApprovalProcess::insert($approvalProcesses);

            // Notify the first approver (user 3 in this case)
            $firstApproverId = $notedByIds !== null ? $notedByIds[0] : $approvedByIds[0];
            $firstApprover = User::with('approverStaffs')->find($firstApproverId);

            if ($firstApprover) {
                $firstApprovalProcess = ApprovalProcess::where('request_form_id', $requestFormData->id)
                    ->where('level', 1)
                    ->first();

                $staff = User::where('id', $firstApprovalProcess->user_id)->first();
                if ($staff) {
                    $staff->notify(new ApprovalProcessNotification(
                        $firstApprovalProcess,
                        $firstApprover->firstName,
                        $requestFormData,
                        $user->firstName,
                        $user->lastName
                    ));
                } else {
                    $firstApprover->notify(new ApprovalProcessNotification(
                        $firstApprovalProcess,
                        $firstApprover->firstName,
                        $requestFormData,
                        $user->firstName,
                        $user->lastName
                    ));
                }



                // Broadcast notification event
                $message = 'You have a request form to approve';
                $date = now();
                $type = 'App\Notifications\ApprovalProcessNotification';
                $read_at = null;
                //  event(new NotificationEvent($firstApprover->id, $message, $date,$type,$read_at));
            }

            // Commit transaction
            DB::commit();
            return response()->json([
                'message' => 'Request form created successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Request form creation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function generateUniqueCode($formType, $branchId)
    {
        $prefixes = [
            'Application For Cash Advance' => 'CA',
            'Cash Disbursement Requisition Slip' => 'CD',
            'Liquidation of Actual Expense' => 'LAE',
            'Purchase Order Requisition Slip' => 'PO',
            'Refund Request' => 'RR',
            'Stock Requisition Slip' => 'SRL',
            'Discount Requisition Form' => 'DRF',
        ];

        if (isset($prefixes[$formType]) && $branchId) {
            // Find the latest request for the specific form type and branch, ordered by the code
            $lastRequest = RequestForm::where('form_type', $formType)
                ->where('branch_code', $branchId)
                ->orderBy('request_code', 'desc') // Assumes unique_code is stored in the DB
                ->first();

            // Determine the next number
            if ($lastRequest) {
                // Extract the numeric part of the code (after the prefix)
                $lastNumber = (int) substr($lastRequest->request_code, strlen($prefixes[$formType]));
                $nextNumber = $lastNumber + 1;
            } else {
                // If no previous record, start from 1
                $nextNumber = 1;
            }

            // Pad the next number with zeros to ensure it is 7 digits long
            $nextNumberPadded = str_pad($nextNumber, 7, '0', STR_PAD_LEFT);

            // Return the prefix along with the incremented number
            return $prefixes[$formType] . $nextNumberPadded;
        }

        return null;
    }
    public function updateRequest(Request $request, $id)
    {

        DB::beginTransaction(); // Start transaction

        try {
            // Find the request form by ID
            $request_data = RequestForm::with('approvalProcess')->findOrFail($id);

            // Decode JSON strings
            $form_data_content = json_decode($request->input('form_data'), true);
            $noted_by = !empty(json_decode($request->input('noted_by'), true)) ? json_decode($request->input('noted_by'), true) : null;
            $approved_by = json_decode($request->input('approved_by'), true);
            $currency = $request->input('currency');
            // Initialize attachment paths
            $existing_attachments = json_decode($request_data->attachment, associative: true) ?? [];

            // Process new attachments (upload)
            $attachment_paths = $existing_attachments; // Start with existing attachments

            if ($request->hasFile('new_attachments')) {
                foreach ($request->file('new_attachments') as $file) {
                    $attachment_paths[] = $file->store('request_form_attachments', 'd_drive'); // Add new file paths
                }
            }

            // Add existing attachment paths (from input)
            foreach ($request->input('attachment_urls', []) as $value) {
                // Ensure the value is valid and not already in the list
                if ($value && !in_array('request_form_attachments/' . $value, $attachment_paths)) {
                    $attachment_paths[] = 'request_form_attachments/' . $value; // Add to list
                }
            }

            // Process removed attachments
            $removed_attachments = $request->input('removed_attachments', []);
            foreach ($removed_attachments as $path) {
                // Delete the file from storage
                if (Storage::disk('d_drive')->exists('request_form_attachments/' . $path)) {
                    Storage::disk('d_drive')->delete('request_form_attachments/' . $path);
                }
                // Remove from the attachment list as well
                $attachment_paths = array_filter($attachment_paths, function ($existing_path) use ($path) {
                    return basename($existing_path) !== basename($path); // Remove the file from the list
                });
            }

            // Update the request form data including attachment
            $request_data->update([
                'form_data' => $form_data_content,
                'noted_by' => $noted_by,
                'approved_by' => $approved_by,
                'attachment' => json_encode(array_values($attachment_paths)),
                'status' => "Pending",
                'currency' => $currency
            ]);

            // Delete existing approval processes
            $request_data->approvalProcess()->delete();

            // Initialize approval process variables
            $level = 1;
            $approvalProcesses = [];

            // Function to handle AVPFinance users and their staff
            function handleAvpFinanceApprovals($userId, &$approvalProcesses, &$level, $requestFormId, $branchId)
            {
                // Check if the user is an AVPFinance
                $user = DB::table('users')->where('id', $userId)->first();
                if ($user && $user->position === 'AVP - Finance') {
                    // Fetch AVPFinance staff
                    $avpFinanceRecord = DB::table('a_v_p_finance_staff')->where('user_id', $userId)->first();
                    if ($avpFinanceRecord) {
                        $avpStaffs = json_decode($avpFinanceRecord->staff_id, true); // Decode staff_id JSON


                        // Fetch staff's branch assignments
                        $staffBranchAssignments = DB::table('a_v_p_finance_staff')
                            ->where('staff_id', $avpStaffs)
                            ->pluck('branch_id')
                            ->first();

                        if ($staffBranchAssignments) {
                            $staffBranches = json_decode($staffBranchAssignments, true); // Decode branch_id JSON

                            // Check if the staff's branches include the request form branch
                            if (in_array($branchId, $staffBranches)) {
                                $approvalProcesses[] = [
                                    'user_id' => $avpStaffs,
                                    'request_form_id' => $requestFormId,
                                    'level' => $level,
                                    'status' => 'Pending',
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ];
                                $level++;
                            }
                        }
                    }
                }

                // Add the AVPFinance user to the approval process
                $approvalProcesses[] = [
                    'user_id' => $userId,
                    'request_form_id' => $requestFormId,
                    'level' => $level,
                    'status' => 'Pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $level++;
            }

            // Process each approver (noted_by and approved_by)

            if ($noted_by !== null) {
                $approvers = [
                    ['type' => 'noted_by', 'ids' => $noted_by],
                    ['type' => 'approved_by', 'ids' => $approved_by]
                ];
            }

            $approvers = [
                ['type' => 'approved_by', 'ids' => $approved_by]
            ];

            foreach ($approvers as $approverGroup) {
                foreach ($approverGroup['ids'] as $approverId) {
                    // Use the helper function to handle AVPFinance and their staff
                    handleAvpFinanceApprovals($approverId, $approvalProcesses, $level, $request_data->id, $request_data->branch_code);
                }
            }

            // Insert all approval processes into the database
            ApprovalProcess::insert($approvalProcesses);

            // Notify first approver
            $firstApprover = $noted_by !== null ? $noted_by[0] : $approved_by[0];
            if ($firstApprover) {
                $firstApproverUser = User::with('approverStaffs')->find($firstApprover);

                if ($firstApproverUser) {
                    $firstApprovalProcess = ApprovalProcess::where('request_form_id', $request_data->id)
                        ->where('level', 1)
                        ->first();

                    $requester = User::find($request_data->user_id);
                    $requesterFirstName = $requester->firstName ?? 'N/A';
                    $requesterLastName = $requester->lastName ?? 'N/A';

                    $firstApproverUser->notify(new ApprovalProcessNotification(
                        $firstApprovalProcess,
                        $firstApproverUser->firstName,
                        $request_data,
                        $requesterFirstName,
                        $requesterLastName
                    ));

                    // Broadcast notification count update
                    $message = 'You have a request form to approve';
                    $date = now();
                    $type = 'App\Notifications\ApprovalProcessNotification';
                    $read_at = null;
                    event(new NotificationEvent(Auth::user()->id, $firstApprovalProcess->user->id));
                }
            }

            DB::commit(); // Commit transaction

            return response()->json(['message' => 'Request form updated successfully'], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack(); // Rollback transaction on error
            return response()->json([
                'message' => 'Request form not found',
                'error' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack(); // Rollback transaction on error
            return response()->json([
                'message' => 'Failed to update request form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function uploadAttachments(Request $request, $requestFormId)
    {

        $requestForm = RequestForm::findOrFail($requestFormId);
        $attachmentIds = [];

        if ($request->hasFile('attachment')) {
            foreach ($request->file('attachment') as $file) {
                $filePath = $file->store('request_form_attachments', 'd_drive');
                $fileName = $file->getClientOriginalName();

                if (!$filePath) {
                    return response()->json([
                        'message' => 'File upload failed',
                    ], 500);
                }

                $attachment = Attachment::create([
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'request_form_id' => $requestFormId,
                ]);

                $attachmentIds[] = $attachment->id;
            }
        }

        if (!empty($attachmentIds)) {
            $requestForm->update([
                'attachment' => $attachmentIds,
            ]);
        }

        return response()->json([
            'message' => "Attachment uploaded successfully"
        ]);
    }
    //VIEW REQUEST
    public function viewRequest($id)
    {
        try {

            $requestForm = RequestForm::findOrFail($id);

            return response()->json([
                'message' => 'Request form retrieved successfully',
                'data' => $requestForm
            ], 200);
        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Request form not found',
            ], 404);
        } catch (\Exception $e) {

            return response()->json([
                'message' => 'An error occurred while retrieving the request form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //VIEW REQUEST FORM CREATED BY SPECIFIC USER

    public function index()
    {
        try {
            $currentUserId = auth()->user()->id;
            $current_branch = auth()->user()->branch_code;


            // Fetch request forms where user_id matches the current user's ID
            $requestForms = RequestForm::where('user_id', $currentUserId)
                ->select('id', 'user_id', 'form_type', 'form_data', 'status', 'currency', 'noted_by', 'approved_by', 'attachment', 'request_code', 'created_at', 'completed_code')
                ->with('approvalProcess')
                ->get();


            // Initialize an array to hold the response data
            $response = $requestForms->map(function ($requestForm) use ($current_branch) {
                $branch = Branch::find($current_branch);
                $branchName = $branch->branch_code;

                // Decode the approvers_id fields, defaulting to empty arrays if null
                $notedByIds = $requestForm->noted_by ?? [];
                $approvedByIds = $requestForm->approved_by ?? [];
                $currency = $requestForm->currency;
                $allApproversIds = array_merge($notedByIds, $approvedByIds);

                // Fetch all approvers in one query
                $allApprovers = User::whereIn('id', $allApproversIds)
                    ->select('id', 'firstName', 'lastName', 'position', 'signature', 'branch')
                    ->get()
                    ->keyBy('id');

                // Fetch all approval statuses and comments in one query
                $approvalData = ApprovalProcess::whereIn('user_id', $allApproversIds)
                    ->where('request_form_id', $requestForm->id)
                    ->get()
                    ->keyBy('user_id');

                // Format noted_by users
                $formattedNotedBy = $notedByIds
                    ? collect($notedByIds)->map(function ($userId) use ($allApprovers, $approvalData) {
                        if (isset($allApprovers[$userId])) {
                            $user = $allApprovers[$userId];
                            $approval = $approvalData[$userId] ?? null;

                            return [
                                'id' => $user->id,
                                'firstName' => $user->firstName,
                                'lastName' => $user->lastName,
                                'status' => $approval->status ?? '',
                                'comment' => $approval->comment ?? '',
                                'position' => $user->position,
                                'signature' => $user->signature,
                            ];
                        }
                    })->filter()->values()->all()
                    : [];

                // Format approved_by users
                $formattedApprovedBy = $approvedByIds
                    ? collect($approvedByIds)->map(function ($userId) use ($allApprovers, $approvalData) {
                        if (isset($allApprovers[$userId])) {
                            $user = $allApprovers[$userId];
                            $approval = $approvalData[$userId] ?? null;

                            return [
                                'id' => $user->id,
                                'firstName' => $user->firstName,
                                'lastName' => $user->lastName,
                                'status' => $approval->status ?? '',
                                'comment' => $approval->comment ?? '',
                                'position' => $user->position,
                                'signature' => $user->signature,
                            ];
                        }
                    })->filter()->values()->all()
                    : [];

                // Get the pending approver
                $pendingApprover = $requestForm->approvalProcess()
                    ->where('status', 'Pending')
                    ->orderBy('level')
                    ->first()?->user;


                    $approverName = "No Pending Approver";

                    if ($pendingApprover) {
                        $approverFromFinanceStaff = AVPFinanceStaff::where('staff_id', $pendingApprover->id)->exists();

                        if ($approverFromFinanceStaff) {
                            $avpUser = User::where('position', 'AVP - Finance')->first();

                            if ($avpUser) {
                                $approverName = [
                                    'approver_name' => "{$avpUser->firstName} {$avpUser->lastName}",
                                ];
                            } else {
                                $approverName = "No AVP Found";
                            }
                        }else {
                            $approverName = [
                               'approver_name' => "{$pendingApprover->firstName} {$pendingApprover->lastName}",

                            ];
                        }
                    }

                return [
                    'id' => $requestForm->id,
                    'user_id' => $requestForm->user_id,
                    'form_type' => $requestForm->form_type,
                    'form_data' => $requestForm->form_data,
                    'created_at' => $requestForm->created_at,
                    'status' => $requestForm->status,
                    'noted_by' => $formattedNotedBy,
                    'currency' => $currency,
                    'approved_by' => $formattedApprovedBy,
                    'requested_by' => auth()->user()->firstName . ' ' . auth()->user()->firstName,
                    'requested_signature' => auth()->user()->signature,
                    'requested_position' => auth()->user()->position,
                    'attachment' => $requestForm->attachment,
                    'pending_approver' => $approverName,
                    'request_code' => "$branchName-$requestForm->request_code",
                    'completed_code' => $requestForm->completed_code
                ];
            });

            return response()->json([
                'message' => 'Request forms retrieved successfully',
                'data' => $response
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving request forms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //VIEW ALL REQUEST FORM OF ALL USERS
    public function viewAllRequests()
    {
        try {

            $users = RequestForm::select('id', 'user_id', 'form_type', 'form_data', 'currency', 'noted_by', 'approved_by', 'status', 'attachment')->get();

            return response()->json([
                'message' => 'Request form retrieved successfully',
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving request form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //DELETE REQUEST
    public function deleteRequest($id)
    {
        try {
            $user = Auth::user();
            $requestForm = RequestForm::where('id', $id)->where('user_id', $user->id)->firstOrFail();

            // if (in_array($requestForm->status, ['Ongoing', 'Approved', 'Disapproved'])) {
            //     return response()->json([
            //         'message' => 'Request form cannot be deleted because it has already been processed'
            //     ], 400);
            // }

            $requestForm->delete();

            return response()->json([
                'message' => 'Request form deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the request form',
                'error' => $e->getMessage()
            ]);
        }
    }
    public function totalRequestSent($user_id)
    {

        try {

            $requestSent = RequestForm::where('user_id', $user_id)->count();
            $totalCompletedRequest = RequestForm::where('user_id', $user_id)->where('status', 'Completed')->count();
            $totalOngoingRequests = RequestForm::where('user_id', $user_id)->where('status', 'Ongoing')->count();
            $totalPendingRequest = RequestForm::where('user_id', $user_id)->where('status', 'Pending')->count();
            $totalDisapprovedRequest = RequestForm::where('user_id', $user_id)->where('status', 'Disapproved')->count();
            return response()->json([
                'message' => "Total number of request sent counted successfully",
                'totalRequestSent' => $requestSent,
                'totalCompletedRequest' => $totalCompletedRequest,
                'totalOngoingRequest' => $totalOngoingRequests,
                'totalPendingRequest' => $totalPendingRequest,
                'totalDisapprovedRequest' => $totalDisapprovedRequest

            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => "An error occured while counting the total request sent",
                'error' => $e->getMessage()
            ]);
        }
    }

    //TOTAL APPROVED REQUESTS BY USER

    public function totalApprovedRequests($user_id)
    {

        try {

            $totalApprovedRequests = RequestForm::where('user_id', $user_id)->where('status', 'Approved')->count();

            return response()->json([
                'message' => "Total number of approved request counted successfully",
                'totalApprovedRequest' => $totalApprovedRequests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => "An error occured while counting the total number of approved request",
                'error' => $e->getMessage()
            ]);
        }
    }

    //TOTAL PENDING REQUESTS BY USER

    public function totalPendingRequests($user_id)
    {

        try {

            $totalPendingRequest = RequestForm::where('user_id', $user_id)->where('status', 'Pending')->count();

            return response()->json([
                'message' => "Total number of pending requests counted successfully",
                'totalPendingRequest' => $totalPendingRequest
            ]);
        } catch (\Exception $e) {
        }
    }

    //VIEW RECENT REQUESTS





}
