<?php

namespace Tests\Feature\Admin;

use App\Models\Pedido;
use App\Models\Presupuesto;
use App\Models\SolicitudReparacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContabilidadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_puede_ver_contabilidad_con_pedidos_y_reparaciones(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);
        $cliente = User::factory()->create(['rol' => 'cliente']);
        $tecnico = User::factory()->create(['rol' => 'tecnico']);

        Pedido::create([
            'user_id' => $cliente->id,
            'estado' => 'pagado',
            'total' => 120.50,
            'nombre' => 'Juan',
            'apellidos' => 'Pérez',
            'telefono' => '600123123',
            'direccion' => 'Calle Real 1',
            'ciudad' => 'Sevilla',
            'provincia' => 'Sevilla',
            'codigo_postal' => '41001',
        ]);

        Pedido::create([
            'user_id' => $cliente->id,
            'estado' => 'pendiente',
            'total' => 999.99,
            'nombre' => 'Ana',
            'apellidos' => 'López',
            'telefono' => '600123124',
            'direccion' => 'Calle Luna 2',
            'ciudad' => 'Cádiz',
            'provincia' => 'Cádiz',
            'codigo_postal' => '11001',
        ]);

        $solicitud = SolicitudReparacion::create([
            'user_id' => $cliente->id,
            'tecnico_id' => $tecnico->id,
            'nombre_completo' => 'Juan Pérez',
            'telefono' => '600123123',
            'email' => $cliente->email,
            'modelo_dispositivo' => 'iPhone 12',
            'tipo_problema' => 'pantalla',
            'descripcion' => 'Rota',
            'modalidad' => 'envio',
            'estado' => 'aceptada',
        ]);

        Presupuesto::create([
            'solicitud_reparacion_id' => $solicitud->id,
            'tecnico_id' => $tecnico->id,
            'importe_total' => 79.50,
            'descripcion' => 'Cambio de pantalla',
            'estado' => 'aceptado',
        ]);

        $respuesta = $this->actingAs($admin)->get(route('admin.contabilidad.index'));

        $respuesta->assertStatus(200);
        $respuesta->assertInertia(fn (Assert $page) => $page
            ->component('admin/contabilidad')
            ->where('resumen.total', 200.0)
            ->where('resumen.pedidos_total', 120.5)
            ->where('resumen.reparaciones_total', 79.5)
            ->where('resumen.pedidos_count', 1)
            ->where('resumen.reparaciones_count', 1)
        );
    }

    public function test_usuario_no_admin_no_puede_ver_contabilidad(): void
    {
        $usuario = User::factory()->create(['rol' => 'cliente']);

        $respuesta = $this->actingAs($usuario)->get(route('admin.contabilidad.index'));

        $respuesta->assertRedirect(route('home'));
    }

    public function test_contabilidad_responde_con_rango_anual(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);

        $respuesta = $this->actingAs($admin)->get(route('admin.contabilidad.index', [
            'rango' => 'anio',
            'anio' => now()->year,
        ]));

        $respuesta->assertStatus(200);
        $respuesta->assertInertia(fn (Assert $page) => $page
            ->component('admin/contabilidad')
            ->where('rango', 'anio')
        );
    }
}
