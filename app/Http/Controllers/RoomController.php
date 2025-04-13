<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\GameRoom;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Events\PlayerJoinedRoom;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;

use function Pest\Laravel\json;

class RoomController extends Controller
{
    public function vsComputer()
    {
        return Inertia::render('Computer');
    }

    public function room()
    {
        return Inertia::render('Room');
    }

    public function createRoom()
    {
        do {
            $roomCode = Str::random(8);
        } while (GameRoom::where('room_code', $roomCode)->exists());

        GameRoom::where(function ($query) {
            $query->where('player1_id', Auth::id())
                ->orWhere('player2_id', Auth::id());
        })->delete();

        $room = GameRoom::create([
            'room_code' => $roomCode,
            'player1_id' => Auth::id(),
        ]);

        //Redis::set('room.' . $room->room_code . '.player1-ready', 0);

        return redirect()->route('room.show', $room->room_code);
    }



    public function joinRoom(Request $request)
    {
        $request->validate([
            'room_code' => 'required|string|size:8',
        ]);

        $room = GameRoom::where('room_code', $request->room_code)->first();

        if (!$room) {
            return back()->withErrors(['room_code' => 'Room not found.']);
        }

        if ($room->player2_id) {
            return back()->withErrors(['room_code' => 'Room is full.']);
        }

        $room->update([
            'player2_id' => Auth::id(),
        ]);

        GameRoom::where(function ($query) {
            $query->where('player1_id', Auth::id())
                ->orWhere('player2_id', Auth::id());
        })->where('room_code', '!=', $room->room_code)->delete();

        //Redis::set('room.' . $room->room_code . '.player2-ready', 0);

        broadcast(new PlayerJoinedRoom($room));

        return redirect()->route('room.show', $room->room_code);
    }

    public function showRoom($roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)
            ->with('player1', 'player2')
            ->firstOrFail();

        return Inertia::render('ShowRoom', [
            'room' => $room,
        ]);
    }

    public function storeDeck(Request $request, $roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)->firstOrFail();

        if (!Redis::exists($room->room_code . '.deck')) {
            Redis::set($room->room_code . '.deck', $request->deck);
        }

        return response()->json(['message' => 'Deck stored successfully']);
    }

    public function playRoom($roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)
            ->with('player1', 'player2')
            ->firstOrFail();

        $player = $room->player1_id === Auth::id() ? $room->player1 : $room->player2;
        $opponent = $room->player1_id === Auth::id() ? $room->player2 : $room->player1;

        $deck = Redis::exists($room->room_code . '.deck') ? json_decode(Redis::get($room->room_code . '.deck')) : [];

        return Inertia::render('PlayRoom', [
            'room' => $room,
            'player' => $player,
            'opponent' => $opponent,
            'deck' => $deck,
        ]);
    }
}
