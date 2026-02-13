<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $titulo }}</title>
</head>
<body style="margin:0; padding:24px; background:#f4f7fb; font-family:Arial, Helvetica, sans-serif; color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto;">
        <tr>
            <td style="padding:0 0 16px 0; text-align:center;">
                <span style="font-size:34px; font-weight:800; letter-spacing:-0.5px; background:linear-gradient(90deg,#7b4dff 0%, #ff2f86 100%); -webkit-background-clip:text; background-clip:text; color:transparent;">
                    Renova
                </span>
            </td>
        </tr>
        <tr>
            <td style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px;">
                <p style="margin:0; font-size:24px; font-weight:700; color:#0f172a;">{{ $titulo }}</p>
                <p style="margin:16px 0 0 0; font-size:15px; line-height:1.6; color:#334155;">{{ $mensaje }}</p>

                @if (!empty($url))
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                        <tr>
                            <td style="border-radius:999px; background:linear-gradient(90deg,#7b4dff 0%, #ff2f86 100%);">
                                <a href="{{ $url }}" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700;">
                                    Ver detalle
                                </a>
                            </td>
                        </tr>
                    </table>
                @endif
            </td>
        </tr>
        <tr>
            <td style="padding-top:14px; text-align:center; font-size:12px; color:#64748b;">
                Renova · Notificación automática
            </td>
        </tr>
    </table>
</body>
</html>
