<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use App\Events\NotificationEvent;

class EmployeeNotification extends Notification
{
    use Notifiable, Queueable;

    /**
     * Create a new notification instance.
     */

    protected $requestForm;

    protected $status;
    protected $firstname;
    protected $formtype;
    protected $comment;
    protected $request_code;


    public function __construct($requestForm, $status, $firstname, $formtype, $request_code, $comment)
    {
        $this->requestForm = $requestForm;
        $this->status = $status;
        $this->firstname = $firstname;
        $this->formtype = $formtype;
        $this->request_code = $request_code;
         $this->comment = $comment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->view('emails.employee', [
                'request_form' => $this->requestForm,
                'status' => $this->status,
                'firstname' => $this->firstname,
                'formtype' => $this->formtype,
                'request_code' => $this->request_code,
                'comment' => $this->comment,
                'date' => Carbon::parse($this->requestForm->created_at)->format('F j, Y')

            ])
            ->subject('Request Form Update - ' . $this->requestForm->form_type . ' ' . now()->format('Y-m-d H:i:s'))
            ->line('Your request has been ' . $this->status)
            ->line('Request Type: ' . $this->requestForm->form_type)
            ->line('Status:' . $this->status);

    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
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
        //broadcast(new NotificationEvent($this->toArray($notifiable)));
        return new BroadcastMessage([
            'message' => 'Your request has been ' . $this->status,
            'form_type' => $this->requestForm->form_type,
            'status' => $this->status,
            'created_at' => now()->toDateTimeString(),
        ]);
    }
}
