<?php

namespace App\Http\Controllers;

use App\Events\GameOver;
use App\Models\GameRoom;
use App\Events\CardPlaced;
use App\Events\CardsDealt;
use App\Events\MessageSent;
use App\Events\PlayerReady;
use Illuminate\Http\Request;
use App\Events\CardsCaptured;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;

class GameController extends Controller
{

    // public function readyUp(Request $request)
    // {
    //     $room = GameRoom::where('room_code', $request->roomCode)->first();
    //     $player = $request->player;

    //     if ($player == $room->player1_id) {
    //         Redis::set('room.' . $room->room_code . '.player1-ready', 1);
    //     } else {
    //         Redis::set('room.' . $room->room_code . '.player2-ready', 1);
    //     }

    //     broadcast(new PlayerReady($room, Auth::user()));
    // }

    public function sendMessage(Request $request, $roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)->firstOrFail();
        $message = $request->input('message');
        $userId = Auth::id();

        broadcast(new MessageSent($message, $roomCode, $userId));

        return response()->json(['message' => 'Message sent']);
    }

    public function dealCards(Request $request, $roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)->firstOrFail();

        $isFirstRound = $request->input('isFirstRound', false);

        if ($isFirstRound) {
            $startingPlayer = rand(0, 1) ? $room->player1_id : $room->player2_id;
            Redis::set($room->room_code . '.current_player', $startingPlayer);
            Redis::set($room->room_code . '.last_tocapture', '');
            Redis::set($room->room_code . '.round', 1);
            Redis::set($room->room_code . '.game_over', false);
            Redis::set($room->room_code . '.playerTables.' . $room->player1_id, 0);
            Redis::set($room->room_code . '.playerTables.' . $room->player2_id, 0);
        } else {
            $lastToCapture = Redis::get($room->room_code . '.last_tocapture');
            $currentPlayer = $lastToCapture ?: (Redis::get($room->room_code . '.current_player') == $room->player1_id
                ? $room->player2_id
                : $room->player1_id);
            Redis::set($room->room_code . '.current_player', $currentPlayer);

            Redis::incr($room->room_code . '.round');
        }

        $deck = json_decode(Redis::get($room->room_code . '.deck'), true);

        // if (!$deck || count($deck) < 6) {
        //     Redis::set($room->room_code . '.game_over', true);
        //     broadcast(new GameOver($room->room_code, json_decode(Redis::get($room->room_code . '.table'), true), $lastToCapture));
        //     return response()->json(['message' => 'Game over'], 200);
        // }

        $playerHand = array_splice($deck, 0, 3);
        $opponentHand = array_splice($deck, 0, 3);
        if ($isFirstRound) {
            $table = array_splice($deck, 0, 4);
        } else {
            $table = json_decode(Redis::get($room->room_code . '.table'), true) ?? [];
        }

        Redis::set($room->room_code . '.deck', json_encode($deck));
        Redis::set($room->room_code . '.playerHand.' . $room->player1_id, json_encode($playerHand));
        Redis::set($room->room_code . '.opponentHand.' . $room->player2_id, json_encode($opponentHand));
        Redis::set($room->room_code . '.table', json_encode($table));

        $currentPlayer = Redis::get($room->room_code . '.current_player');
        $lastToCapture = Redis::get($room->room_code . '.last_tocapture');
        $round = Redis::get($room->room_code . '.round');
        $gameOver = Redis::get($room->room_code . '.game_over');

        broadcast(new CardsDealt($room->room_code, $playerHand, $opponentHand, $table, $deck, $currentPlayer, $lastToCapture, $round, $gameOver));

        return response()->json(['message' => 'Cards']);
    }

    public function placeCard(Request $request, $roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)->firstOrFail();
        $playerId = Auth::id();

        $currentPlayer = Redis::get($room->room_code . '.current_player');
        if ($playerId != $currentPlayer) {
            return response()->json(['error' => 'Not your turn'], 403);
        }

        $card = $request->input('card');

        $table = json_decode(Redis::get($room->room_code . '.table'), true) ?? [];

        $table[] = $card;
        Redis::set($room->room_code . '.table', json_encode($table));

        $playerHandKey = $room->player1_id == $playerId
            ? 'playerHand.' . $room->player1_id
            : 'opponentHand.' . $room->player2_id;

        $playerHand = json_decode(Redis::get($room->room_code . '.' . $playerHandKey), true);
        $playerHand = array_filter($playerHand, fn($c) => $c['id'] !== $card['id']);
        Redis::set($room->room_code . '.' . $playerHandKey, json_encode(array_values($playerHand)));

        $opponentHandKey = $room->player1_id == $playerId
            ? 'opponentHand.' . $room->player2_id
            : 'playerHand.' . $room->player1_id;
        $opponentHand = json_decode(Redis::get($room->room_code . '.' . $opponentHandKey), true);

        if (!empty($opponentHand)) {
            $newCurrentPlayer = $playerId == $room->player1_id ? $room->player2_id : $room->player1_id;
            Redis::set($room->room_code . '.current_player', $newCurrentPlayer);
        }

        $currentPlayer = Redis::get($room->room_code . '.current_player');
        $lastToCapture = Redis::get($room->room_code . '.last_tocapture');
        $round = Redis::get($room->room_code . '.round');
        $gameOver = Redis::get($room->room_code . '.game_over');

        $table = json_decode(Redis::get($room->room_code . '.table'), true);
        $playerHand = json_decode(Redis::get($room->room_code . '.playerHand.' . $room->player1_id), true);
        $opponentHand = json_decode(Redis::get($room->room_code . '.opponentHand.' . $room->player2_id), true);

        broadcast(new CardPlaced($room->room_code, $card, $playerId, $table, $playerHand, $opponentHand, $currentPlayer, $lastToCapture, $round, $gameOver));

        $this->checkForNewDeal($room);

        return response()->json(['message' => 'Card placed']);
    }

    public function captureCards(Request $request, $roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)->firstOrFail();
        $playerId = Auth::id();

        $currentPlayer = Redis::get($room->room_code . '.current_player');
        if ($playerId != $currentPlayer) {
            return response()->json(['error' => 'Not your turn'], 403);
        }

        $playerCaptured = $request->input('playerCards');
        $tableCaptured = $request->input('tableCards');

        Redis::set($room->room_code . '.last_tocapture', $playerId);

        $playerHandKey = $room->player1_id == $playerId
            ? 'playerHand.' . $room->player1_id
            : 'opponentHand.' . $room->player2_id;

        $playerTakenKey = $room->player1_id == $playerId
            ? 'playerTaken.' . $room->player1_id
            : 'opponentTaken.' . $room->player2_id;

        $table = json_decode(Redis::get($room->room_code . '.table'), true) ?? [];
        $table = array_filter($table, fn($c) => !in_array($c['id'], array_column($tableCaptured, 'id')));
        Redis::set($room->room_code . '.table', json_encode(array_values($table)));

        $playerHand = json_decode(Redis::get($room->room_code . '.' . $playerHandKey), true) ?? [];
        $playerHand = array_filter($playerHand, fn($c) => !in_array($c['id'], array_column($playerCaptured, 'id')));
        Redis::set($room->room_code . '.' . $playerHandKey, json_encode(array_values($playerHand)));

        $playerTaken = Redis::exists($room->room_code . '.' . $playerTakenKey)
            ? json_decode(Redis::get($room->room_code . '.' . $playerTakenKey), true)
            : [];

        $playerTaken = array_merge($playerTaken, $playerCaptured, $tableCaptured);
        Redis::set($room->room_code . '.' . $playerTakenKey, json_encode(array_values($playerTaken)));

        $opponentHandKey = $room->player1_id == $playerId
            ? 'opponentHand.' . $room->player2_id
            : 'playerHand.' . $room->player1_id;
        $opponentHand = json_decode(Redis::get($room->room_code . '.' . $opponentHandKey), true);

        if (!empty($opponentHand)) {
            $newCurrentPlayer = $playerId == $room->player1_id ? $room->player2_id : $room->player1_id;
            Redis::set($room->room_code . '.current_player', $newCurrentPlayer);
        }

        $currentPlayer = Redis::get($room->room_code . '.current_player');
        $lastToCapture = Redis::get($room->room_code . '.last_tocapture');
        $round = Redis::get($room->room_code . '.round');
        $gameOver = Redis::get($room->room_code . '.game_over');

        $table = json_decode(Redis::get($room->room_code . '.table'), true);
        $playerHand = json_decode(Redis::get($room->room_code . '.playerHand.' . $room->player1_id), true);
        $opponentHand = json_decode(Redis::get($room->room_code . '.opponentHand.' . $room->player2_id), true);
        $playerTaken = json_decode(Redis::get($room->room_code . '.playerTaken.' . $room->player1_id), true);
        $opponentTaken = json_decode(Redis::get($room->room_code . '.opponentTaken.' . $room->player2_id), true);

        if (empty($table)) {
            Redis::incr($room->room_code . '.playerTables.' . $playerId);
        }

        broadcast(new CardsCaptured($room->room_code, $playerId, $playerCaptured, $tableCaptured, $table, $playerHand, $opponentHand, $playerTaken, $opponentTaken, $currentPlayer, $lastToCapture, $round, $gameOver));

        $this->checkForNewDeal($room);

        return response()->json(['message' => 'Cards captured']);
    }

    private function checkForNewDeal($room)
    {
        $player1Hand = json_decode(Redis::get($room->room_code . '.playerHand.' . $room->player1_id), true) ?? [];
        $player2Hand = json_decode(Redis::get($room->room_code . '.opponentHand.' . $room->player2_id), true) ?? [];

        if (empty($player1Hand) && empty($player2Hand)) {
            $deck = json_decode(Redis::get($room->room_code . '.deck'), true);
            if (empty($deck)) {
                $lastToCapture = Redis::get($room->room_code . '.last_tocapture');
                if ($lastToCapture) {
                    $table = json_decode(Redis::get($room->room_code . '.table'), true) ?? [];
                    if (!empty($table)) {
                        $takenKey = $lastToCapture == $room->player1_id
                            ? 'playerTaken.' . $room->player1_id
                            : 'opponentTaken.' . $room->player2_id;

                        $playerTaken = json_decode(Redis::get($room->room_code . '.' . $takenKey), true) ?? [];
                        $playerTaken = array_merge($playerTaken, $table);
                        Redis::set($room->room_code . '.' . $takenKey, json_encode(array_values($playerTaken)));

                        Redis::set($room->room_code . '.table', json_encode([]));
                    }
                }
                sleep(2);
                $playerTaken = json_decode(Redis::get($room->room_code . '.playerTaken.' . $room->player1_id), true) ?? [];
                $opponentTaken = json_decode(Redis::get($room->room_code . '.opponentTaken.' . $room->player2_id), true) ?? [];

                $playerTables = (int)Redis::get($room->room_code . '.playerTables.' . $room->player1_id) ?? 0;
                $opponentTables = (int)Redis::get($room->room_code . '.playerTables.' . $room->player2_id) ?? 0;

                $playerTotal = 0;
                $opponentTotal = 0;
                $winner = 0;

                $playerCards = count($playerTaken);
                $opponentCards = count($opponentTaken);

                if ($playerCards > $opponentCards) {
                    $playerTotal += 3;
                } else if ($opponentCards > $playerCards) {
                    $opponentTotal += 3;
                } else {
                    $playerTotal += 1;
                    $opponentTotal += 1;
                }

                $playerSpades = count(array_filter($playerTaken, fn($card) => $card['suit'] == '♠'));
                $opponentSpades = count(array_filter($opponentTaken, fn($card) => $card['suit'] == '♠'));

                if ($playerSpades > $opponentSpades) {
                    $playerTotal += 2;
                } else {
                    $opponentTotal += 2;
                }

                $tenOfDiamondsPlayer = count(array_filter($playerTaken, fn($card) => $card['value'] == '10' && $card['suit'] == '♦'));
                $tenOfDiamondsOpponent = count(array_filter($opponentTaken, fn($card) => $card['value'] == '10' && $card['suit'] == '♦'));

                if ($tenOfDiamondsPlayer > $tenOfDiamondsOpponent) {
                    $playerTotal += 2;
                } else {
                    $opponentTotal += 2;
                }

                $twoOfSpadesPlayer = count(array_filter($playerTaken, fn($card) => $card['value'] == '2' && $card['suit'] == '♠'));
                $twoOfSpadesOpponent = count(array_filter($opponentTaken, fn($card) => $card['value'] == '2' && $card['suit'] == '♠'));

                if ($twoOfSpadesPlayer > $twoOfSpadesOpponent) {
                    $playerTotal += 1;
                } else {
                    $opponentTotal += 1;
                }

                $playerAces = count(array_filter($playerTaken, fn($card) => $card['value'] == 'A'));
                $opponentAces = count(array_filter($opponentTaken, fn($card) => $card['value'] == 'A'));

                $playerTotal += $playerAces + $playerTables;
                $opponentTotal += $opponentAces + $opponentTables;

                if ($playerTotal > $opponentTotal) {
                    $winner = $room->player1_id;
                } elseif ($opponentTotal > $playerTotal) {
                    $winner = $room->player2_id;
                } else {
                    $winner = 0;
                }

                Redis::set($room->room_code . '.game_over', true);

                broadcast(new GameOver($room->room_code, $table, $lastToCapture, $playerCards, $opponentCards, $playerSpades, $opponentSpades, $tenOfDiamondsPlayer, $tenOfDiamondsOpponent, $twoOfSpadesPlayer, $twoOfSpadesOpponent, $playerAces, $opponentAces, $playerTables, $opponentTables, $playerTotal, $opponentTotal, $winner));
            } else {
                sleep(3);
                $this->dealCards(new Request([], ['isFirstRound' => false]), $room->room_code);
            }
        }
    }
}
