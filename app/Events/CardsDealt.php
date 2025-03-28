<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CardsDealt implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $playerHand;
    public $opponentHand;
    public $table;
    public $deck;


    public function __construct($roomCode, $playerHand, $opponentHand, $table, $deck)
    {
        $this->roomCode = $roomCode;
        $this->playerHand = $playerHand;
        $this->opponentHand = $opponentHand;
        $this->table = $table;
        $this->deck = $deck;
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('room.' . $this->roomCode),
        ];
    }

    public function broadcastWith()
    {
        return [
            'playerHand' => $this->playerHand,
            'opponentHand' => $this->opponentHand,
            'table' => $this->table,
            'deck' => $this->deck,
        ];
    }
}
