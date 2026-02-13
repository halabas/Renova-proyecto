<?php

namespace App\Http\Controllers;

use App\Models\Devolucion;
use App\Notifications\NotificacionClase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Refund;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;

class DevolucionController extends Controller
{
    public function index()
    {
        $devoluciones = Devolucion::with(['pedido', 'user'])
            ->latest()
            ->get()
            ->map(function ($devolucion) {
                return [
                    'id' => $devolucion->id,
                    'estado' => $devolucion->estado,
                    'motivo' => $devolucion->motivo,
                    'comentario' => $devolucion->comentario,
                    'fecha' => $devolucion->created_at?->format('d/m/Y H:i'),
                    'pedido_id' => $devolucion->pedido_id,
                    'cliente' => $devolucion->user?->name,
                    'email' => $devolucion->user?->email,
                    'total' => $devolucion->pedido ? (float) $devolucion->pedido->total : null,
                ];
            });

        return Inertia::render('admin/devoluciones', [
            'devoluciones' => $devoluciones,
        ]);
    }

    public function aprobar(Request $request, Devolucion $devolucion)
    {
        if ($devolucion->estado === 'reembolsada') {
            return back()->with('error', 'No puedes aprobar una devolución reembolsada.');
        }

        $devolucion->estado = 'aprobada';
        $devolucion->save();

        if ($devolucion->user) {
            $devolucion->user->notify(new NotificacionClase(
                'Devolución aprobada',
                'Tu solicitud de devolución del pedido #'.$devolucion->pedido_id.' ha sido aprobada.',
                '/ajustes/pedidos'
            ));
        }

        return back()->with('success', 'Devolución aprobada.');
    }

    public function rechazar(Request $request, Devolucion $devolucion)
    {
        if ($devolucion->estado === 'reembolsada') {
            return back()->with('error', 'No puedes rechazar una devolución reembolsada.');
        }

        $devolucion->estado = 'rechazada';
        $devolucion->save();

        if ($devolucion->user) {
            $devolucion->user->notify(new NotificacionClase(
                'Devolución rechazada',
                'Tu solicitud de devolución del pedido #'.$devolucion->pedido_id.' ha sido rechazada.',
                '/ajustes/pedidos'
            ));
        }

        return back()->with('success', 'Devolución rechazada.');
    }

    public function reembolsar(Request $request, Devolucion $devolucion)
    {
        if ($devolucion->estado !== 'aprobada') {
            return back()->with('error', 'Solo puedes reembolsar devoluciones aprobadas.');
        }

        $pedido = $devolucion->pedido;
        if (! $pedido || ! $pedido->stripe_sesion_id) {
            return back()->with('error', 'No se encontró información de pago.');
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return back()->with('error', 'Stripe no está configurado.');
        }

        Stripe::setApiKey($secret);
        $session = StripeSession::retrieve($pedido->stripe_sesion_id);
        $paymentIntentId = $session->payment_intent;

        if (! $paymentIntentId) {
            return back()->with('error', 'No se pudo localizar el pago.');
        }

        Refund::create([
            'payment_intent' => $paymentIntentId,
        ]);

        $devolucion->estado = 'reembolsada';
        $devolucion->save();

        $pedido->estado = 'cancelado';
        $pedido->save();

        if ($devolucion->user) {
            $devolucion->user->notify(new NotificacionClase(
                'Reembolso completado',
                'Se ha emitido el reembolso del pedido #'.$pedido->id.'.',
                '/ajustes/pedidos'
            ));
        }

        return back()->with('success', 'Devolución reembolsada.');
    }
}
