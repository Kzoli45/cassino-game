<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\GameRoom;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Events\PlayerJoinedRoom;
use Illuminate\Support\Facades\Auth;

class GameController extends Controller
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

        $room = GameRoom::create([
            'room_code' => $roomCode,
            'player1_id' => Auth::id(),
        ]);

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

        broadcast(new PlayerJoinedRoom($room));

        return redirect()->route('room.show', $room->room_code);

        sleep(3);
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

    public function playRoom($roomCode)
    {
        $room = GameRoom::where('room_code', $roomCode)
            ->with('player1', 'player2')
            ->firstOrFail();

        return Inertia::render('PlayRoom', [
            'room' => $room,
        ]);
    }

    public function cleanupRooms()
    {
        GameRoom::whereNull('player1_id')->orWhereNull('player2_id')->delete();
    }
}
