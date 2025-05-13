<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotedBy extends Model
{
    protected $guarded = [];

    public function notedBy()
    {
        return $this->belongsTo(User::class, "noted_by", "id");
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
