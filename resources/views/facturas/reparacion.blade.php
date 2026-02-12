<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Factura reparación #{{ $solicitud->id }}</title>
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { font-size: 12px; color: #1f2937; }
        .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .brand { font-size: 20px; font-weight: 700; color: #9747ff; }
        .muted { color: #6b7280; }
        .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
        .right { text-align: right; }
        .total { font-size: 18px; font-weight: 700; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">Renova</div>
            <div class="muted">Factura de reparación</div>
        </div>
        <div>
            <div><strong>Solicitud:</strong> #{{ $solicitud->id }}</div>
            <div><strong>Fecha:</strong> {{ $solicitud->created_at?->format('d/m/Y H:i') }}</div>
        </div>
    </div>

    <div class="box">
        <strong>Cliente</strong><br>
        {{ $solicitud->nombre_completo }}<br>
        {{ $solicitud->email }}<br>
        {{ $solicitud->telefono }}
    </div>

    <div class="box">
        <strong>Dispositivo</strong><br>
        Modelo: {{ $solicitud->modelo_dispositivo }}<br>
        Problema: {{ $solicitud->tipo_problema }}<br>
        Modalidad: {{ $solicitud->modalidad }}
    </div>

    <div class="box">
        <strong>Concepto</strong><br>
        {{ $presupuesto->descripcion }}
        <div class="right" style="margin-top: 10px;">
            <div class="muted">IVA incluido</div>
            <div class="total">Total: {{ number_format((float) $presupuesto->importe_total, 2) }} €</div>
        </div>
    </div>
</body>
</html>
