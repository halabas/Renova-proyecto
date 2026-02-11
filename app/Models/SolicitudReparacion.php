<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudReparacion extends Model
{
    protected $table = 'solicitudes_reparacion';

    protected $fillable = [
        'user_id',
        'nombre_completo',
        'telefono',
        'email',
        'modelo_dispositivo',
        'tipo_problema',
        'descripcion',
        'modalidad',
        'estado',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
