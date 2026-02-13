<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NotificacionClase extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $titulo,
        private readonly string $mensaje,
        private readonly ?string $url = null,
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject($this->titulo)
            ->view('emails.notificacion-renova', [
                'titulo' => $this->titulo,
                'mensaje' => $this->mensaje,
                'url' => $this->url ? url($this->url) : null,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'titulo' => $this->titulo,
            'mensaje' => $this->mensaje,
            'url' => $this->url,
        ];
    }
}
