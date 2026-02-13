<?php

namespace Tests\Feature\Reparaciones;

use App\Models\SolicitudReparacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SolicitudReparacionTest extends TestCase
{
    use RefreshDatabase;

    public function test_pagina_reparaciones_carga_correctamente(): void
    {
        $response = $this->get(route('reparaciones.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('reparaciones/index'));
    }

    public function test_no_autenticado_no_puede_crear_solicitud_reparacion(): void
    {
        $response = $this->post(route('reparaciones.solicitudes.store'), [
            'direccion_id' => 1,
            'modelo_dispositivo' => 'iPhone 12',
            'tipo_problema' => 'pantalla',
            'descripcion' => 'Pantalla rota',
            'modalidad' => 'envio',
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_solicitud_reparacion_falla_si_direccion_no_pertenece_al_usuario(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('reparaciones.solicitudes.store'), [
            'direccion_id' => 12345,
            'modelo_dispositivo' => 'iPhone 12',
            'tipo_problema' => 'pantalla',
            'descripcion' => 'Pantalla rota',
            'modalidad' => 'envio',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Selecciona una dirección válida.');
    }

    public function test_revision_pagada_falla_si_no_hay_borrador_en_sesion(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('reparaciones.solicitudes.pago-revision.success'));

        $response->assertRedirect(route('reparaciones.index'));
        $response->assertSessionHas('error', 'No hay una solicitud pendiente de confirmar.');
        $this->assertDatabaseCount((new SolicitudReparacion())->getTable(), 0);
    }
}
