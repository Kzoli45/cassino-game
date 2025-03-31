<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class CardPlaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $card;
    public $playerId;
    public $table;
    public $playerHand;
    public $opponentHand;
    public $currentPlayer;
    public $lastToCapture;
    public $round;
    public $gameOver;

    public function __construct($roomCode, $card, $playerId, $table, $playerHand, $opponentHand, $currentPlayer, $lastToCapture, $round, $gameOver)
    {
        $this->roomCode = $roomCode;
        $this->card = $card;
        $this->playerId = $playerId;
        $this->table = $table;
        $this->playerHand = $playerHand;
        $this->opponentHand = $opponentHand;
        $this->currentPlayer = $currentPlayer;
        $this->lastToCapture = $lastToCapture;
        $this->round = $round;
        $this->gameOver = $gameOver;
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
            'card' => $this->card,
            'playerId' => $this->playerId,
            'table' => $this->table,
            'playerHand' => $this->playerHand,
            'opponentHand' => $this->opponentHand,
            'currentPlayer' => $this->currentPlayer,
            'lastToCapture' => $this->lastToCapture,
            'round' => $this->round,
            'gameOver' => $this->gameOver,
        ];
    }
}
