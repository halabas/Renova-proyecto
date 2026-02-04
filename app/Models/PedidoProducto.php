<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PedidoProducto extends Model
{
    protected $fillable = [
        'pedido_id',
        'producto_type',
        'producto_id',
        'nombre',
        'precio_unitario',
        'cantidad',
        'datos',
    ];

    protected $casts = [
        'datos' => 'array',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }

    public function producto()
    {
        return $this->morphTo();
    }
}
