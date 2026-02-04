<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoCarrito extends Model
{
    protected $fillable = [
        'user_id',
        'producto_id',
        'producto_type',
        'cantidad',
        'precio_unitario',
    ];

    public function producto()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
