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

class CardsCaptured implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $playerId;
    public $playerCaptured;
    public $tableCaptured;
    public $table;
    public $playerHand;
    public $opponentHand;
    public $playerTaken;
    public $opponentTaken;

    public function __construct($roomCode, $playerId, $playerCaptured, $tableCaptured, $table, $playerHand, $opponentHand, $playerTaken, $opponentTaken)
    {
        $this->roomCode = $roomCode;
        $this->playerId = $playerId;
        $this->playerCaptured = $playerCaptured;
        $this->tableCaptured = $tableCaptured;
        $this->table = $table;
        $this->playerHand = $playerHand;
        $this->opponentHand = $opponentHand;
        $this->playerTaken = $playerTaken;
        $this->opponentTaken = $opponentTaken;
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
            'playerId' => $this->playerId,
            'playerCaptured' => $this->playerCaptured,
            'tableCaptured' => $this->tableCaptured,
            'table' => $this->table,
            'playerHand' => $this->playerHand,
            'opponentHand' => $this->opponentHand,
            'playerTaken' => $this->playerTaken,
            'opponentTaken' => $this->opponentTaken,
        ];
    }
}
