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
    public $currentPlayer;
    public $lastToCapture;
    public $round;
    public $gameOver;


    public function __construct($roomCode, $playerHand, $opponentHand, $table, $deck, $currentPlayer, $lastToCapture, $round, $gameOver)
    {
        $this->roomCode = $roomCode;
        $this->playerHand = $playerHand;
        $this->opponentHand = $opponentHand;
        $this->table = $table;
        $this->deck = $deck;
        $this->lastToCapture = $lastToCapture;
        $this->currentPlayer = $currentPlayer;
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
            'playerHand' => $this->playerHand,
            'opponentHand' => $this->opponentHand,
            'table' => $this->table,
            'deck' => $this->deck,
            'currentPlayer' => $this->currentPlayer,
            'lastToCapture' => $this->lastToCapture,
            'round' => $this->round,
            'gameOver' => $this->gameOver,
        ];
    }
}
