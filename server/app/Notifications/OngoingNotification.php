<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use App\Events\NotificationEvent;

class OngoingNotification extends Notification
{
    use Notifiable, Queueable;

    /**
     * Create a new notification instance.
     */

    protected $requestForm;

    protected $status;
    protected $firstname;
    protected $formtype;
    protected $request_code;




    public function __construct($requestForm, $status, $firstname, $formtype, $request_code)
    {
        $this->requestForm = $requestForm;
        $this->status = $status;
        $this->firstname = $firstname;
        $this->formtype = $formtype;
        $this->request_code = $request_code;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }


    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Your request has been ' . $this->status,
            'form_type' => $this->requestForm->form_type,
            'status' => $this->status,
            'created_at' => now()->toDateTimeString(),
            'request_reference' => 'requester',
            'request_id' => $this->requestForm->id,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'message' => 'Your request has been ' . $this->status,
        ]);
    }
}
