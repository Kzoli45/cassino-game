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

class GameOver implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // broadcast(new GameOver($room->room_code, $table, $lastToCapture, $playerCards, $opponentCards, $playerSpades, $opponentSpades, $tenOfDiamondsPlayer, $tenOfDiamondsOpponent, $twoOfSpadesPlayer, $twoOfSpadesOpponent, $playerAces, $opponentAces, $playerTables, $opponentTables, $playerTotal, $opponentTotal, $winner));

    public $roomCode;
    public $table;
    public $lastToCapture;
    public $playerCards;
    public $opponentCards;
    public $playerSpades;
    public $opponentSpades;
    public $tenOfDiamondsPlayer;
    public $tenOfDiamondsOpponent;
    public $twoOfSpadesPlayer;
    public $twoOfSpadesOpponent;
    public $playerAces;
    public $opponentAces;
    public $playerTables;
    public $opponentTables;
    public $playerTotal;
    public $opponentTotal;
    public $winner;


    public function __construct($roomCode, $table, $lastToCapture, $playerCards, $opponentCards, $playerSpades, $opponentSpades, $tenOfDiamondsPlayer, $tenOfDiamondsOpponent, $twoOfSpadesPlayer, $twoOfSpadesOpponent, $playerAces, $opponentAces, $playerTables, $opponentTables, $playerTotal, $opponentTotal, $winner)
    {
        $this->roomCode = $roomCode;
        $this->table = $table;
        $this->lastToCapture = $lastToCapture;
        $this->playerCards = $playerCards;
        $this->opponentCards = $opponentCards;
        $this->playerSpades = $playerSpades;
        $this->opponentSpades = $opponentSpades;
        $this->tenOfDiamondsPlayer = $tenOfDiamondsPlayer;
        $this->tenOfDiamondsOpponent = $tenOfDiamondsOpponent;
        $this->twoOfSpadesPlayer = $twoOfSpadesPlayer;
        $this->twoOfSpadesOpponent = $twoOfSpadesOpponent;
        $this->playerAces = $playerAces;
        $this->opponentAces = $opponentAces;
        $this->playerTables = $playerTables;
        $this->opponentTables = $opponentTables;
        $this->playerTotal = ($playerTotal);
        $this->opponentTotal = ($opponentTotal);
        $this->winner = $winner;
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

    public function broadcastWith(): array
    {
        return [
            'table' => $this->table,
            'lastToCapture' => $this->lastToCapture,
            'playerCards' => $this->playerCards,
            'opponentCards' => $this->opponentCards,
            'playerSpades' => $this->playerSpades,
            'opponentSpades' => $this->opponentSpades,
            'tenOfDiamondsPlayer' => $this->tenOfDiamondsPlayer,
            'tenOfDiamondsOpponent' => $this->tenOfDiamondsOpponent,
            'twoOfSpadesPlayer' => $this->twoOfSpadesPlayer,
            'twoOfSpadesOpponent' => $this->twoOfSpadesOpponent,
            'playerAces' => $this->playerAces,
            'opponentAces' => $this->opponentAces,
            'playerTables' => $this->playerTables,
            'opponentTables' => $this->opponentTables,
            'playerTotal' => $this->playerTotal,
            'opponentTotal' => $this->opponentTotal,
            'winner' => $this->winner,
        ];
    }
}
