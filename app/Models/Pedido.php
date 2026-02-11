<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $casts = [
        'enviado_at' => 'datetime',
        'recibido_at' => 'datetime',
    ];
    protected $fillable = [
        'user_id',
        'estado',
        'total',
        'stripe_sesion_id',
        'nombre',
        'apellidos',
        'telefono',
        'direccion',
        'ciudad',
        'provincia',
        'codigo_postal',
        'estado_envio',
        'enviado_at',
        'recibido_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function productos()
    {
        return $this->hasMany(PedidoProducto::class);
    }

    public function devolucion()
    {
        return $this->hasOne(Devolucion::class);
    }

}
