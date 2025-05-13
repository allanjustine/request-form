<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'userName',
        'firstName',
        'lastName',
        'contact',
        'branch_code',
        'email',
        'password',
        'position',
        'signature',
        'role',
        'employee_id',
        'branch',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'fullName'
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function requestForms()
    {
        return $this->hasMany(RequestForm::class);
    }
    public function approvalSteps()
    {
        return $this->hasMany(ApprovalStep::class, 'approver_id');
    }
    public function approvers()
    {
        return $this->hasMany(Approver::class, 'user_id');
    }
    public function approver()
    {
        return $this->hasOne(Approver::class, 'user_id');
    }

    public function approverStaffs()
    {
        return $this->hasMany(AVPFinanceStaff::class, 'staff_id');
    }
    public function userApprover()
    {
        return $this->belongsTo(AVPFinanceStaff::class, 'user_id');
    }
    public function approvalProcess()
    {
        return $this->hasMany(ApprovalProcess::class);
    }
    public function hasRole($role)
    {
        return $this->role === $role;
    }
    // Approver model
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_code');
    }

    public function areaManagers()
    {
        return $this->hasMany(AreaManager::class);
    }

    public function getFullNameAttribute()
    {
        return "{$this->firstName} {$this->lastName}";
    }

    public function notedBies()
    {
        return $this->hasMany(NotedBy::class);
    }

    public function approvedBies()
    {
        return $this->hasMany(ApprovedBy::class);
    }

    /**
     * The default values for attributes.
     *
     * @var array<string, mixed>
     */


    /**
     * The primary key for the model.
     *
     * @var string
     */
}
