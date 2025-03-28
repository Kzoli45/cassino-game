<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Events\CardsDealt;
use App\Events\PlayerReady;
use Illuminate\Http\Request;
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

    public function dealCards(Request $request, $roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)->firstOrFail();

        $isFirstRound = $request->input('isFirstRound', false);

        $deck = json_decode(Redis::get($room->room_code . '.deck'), true);

        if (!$deck || count($deck) < 6) {
            return response()->json(['error' => 'Not enough cards in deck'], 400);
        }

        $playerHand = array_splice($deck, 0, 3);
        $opponentHand = array_splice($deck, 0, 3);

        $table = $isFirstRound ? array_splice($deck, 0, 4) : json_decode(Redis::get($room->room_code . '.table'), true);

        Redis::set($room->room_code . '.deck', json_encode($deck));
        Redis::set($room->room_code . '.playerHand.' . $room->player1_id, json_encode($playerHand));
        Redis::set($room->room_code . '.opponentHand.' . $room->player2_id, json_encode($opponentHand));
        Redis::set($room->room_code . '.table', json_encode($table));

        broadcast(new CardsDealt($room->room_code, $playerHand, $opponentHand, $table, $deck));

        return response()->json(['message' => 'Cards dealt successfully']);
    }
}
