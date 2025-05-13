<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovedBy extends Model
{
    protected $guarded = [];

    public function approvedBy()
    {
        return $this->belongsTo(User::class, "approved_by", "id");
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
