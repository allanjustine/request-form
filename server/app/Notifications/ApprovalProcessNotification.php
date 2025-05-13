<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Events\NotificationEvent;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\InteractsWithSockets;

class ApprovalProcessNotification extends Notification
{
    use Queueable, InteractsWithSockets;

    /**
     * Create a new notification instance.
     */


    protected $approvalProcess;
    protected $firstname;
    protected $requestForm;

    protected $requesterFirstname;
    protected $requesterLastname;
    public function __construct($approvalProcess, $firstname, $requestForm, $requesterFirstname, $requesterLastname)
    {
        $this->approvalProcess = $approvalProcess;
        $this->firstname = $firstname;
        $this->requestForm = $requestForm;
        $this->requesterFirstname = $requesterFirstname;
        $this->requesterLastname = $requesterLastname;
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

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $approvalUrl = route('view.single.request.form.for.approval', ['request_form_id' => $this->requestForm->id]);
        return (new MailMessage)
            ->view('emails.approval_process', [
                'approvalProcess' => $this->approvalProcess,
                'firstname' => $this->firstname,
                'approvalUrl' => $approvalUrl,
                'requesterFirstname' => $this->requesterFirstname,
                'requesterLastname' => $this->requesterLastname,
            ])
            ->subject('You have a new request form need to approve - ' . $this->requestForm->form_type . ' ' . now()->format('Y-m-d H:i:s'))
            ->line('You have a new request form to approve.')
            ->line('Request Form Type : ' . $this->approvalProcess->requestForm->form_type);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $approvalUrl = route('view.single.request.form.for.approval', ['request_form_id' => $this->requestForm->id]);
        return [
            'message' => 'You have a new request form to approve',
            'request_form_id' => $this->approvalProcess->requestForm->form_type,
            'created_at' => now()->toDateTimeString(),
            'approvalUrl' => $approvalUrl,
            'requesterFirstname' => $this->requesterFirstname,
            'requesterLastname' => $this->requesterLastname,
            'request_reference' => 'approver',
            'request_id' => $this->approvalProcess->requestForm->id,

            //'level' => $this->approvalProcess->level,
            //'status' => $this->approvalProcess->status,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'message' => 'You have a new request form to approve',
        ]);
    }
}
