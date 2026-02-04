<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Direccion extends Model
{
    protected $table = 'direcciones';

    protected $fillable = [
        'user_id',
        'etiqueta',
        'nombre',
        'apellidos',
        'telefono',
        'direccion',
        'ciudad',
        'provincia',
        'codigo_postal',
        'predeterminada',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
