<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Modelo extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'marca_id', 'precio_base', 'descripcion', 'fotos'];

    public function marca()
    {
        return $this->belongsTo(Marca::class);
    }

    public function moviles()
    {
        return $this->hasMany(Movil::class);
    }

    public function componentes()
    {
        return $this->hasMany(Componente::class);
    }
}
