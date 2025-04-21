<?php

use App\Models\User;
use App\Models\GameRoom;
use Illuminate\Support\Str;

test('authenticated user can create a room', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/rooms/create');

    $response->assertRedirect();

    $room = GameRoom::where('player1_id', $user->id)->first();

    expect($room)->not->toBeNull();
    expect($room->room_code)->toHaveLength(8);
});

test('authenticated user can join an existing room', function () {
    $player1 = User::factory()->create();
    $player2 = User::factory()->create();

    $room = GameRoom::create([
        'room_code' => 'ABCDEFGH',
        'player1_id' => $player1->id,
    ]);

    $response = $this
        ->actingAs($player2)
        ->post('/rooms/join', ['room_code' => 'ABCDEFGH']);

    $response->assertRedirect();

    $room->refresh();

    expect($room->player2_id)->toEqual($player2->id);
});

test('joining a room with invalid code returns error', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/rooms/join', [
        'room_code' => 'INVALID1',
    ]);

    $response->assertSessionHasErrors('room_code');
});

test('user cannot join a full room', function () {
    $player1 = User::factory()->create();
    $player2 = User::factory()->create();
    $player3 = User::factory()->create();

    $room = GameRoom::create([
        'room_code' => 'FULLROOM',
        'player1_id' => $player1->id,
        'player2_id' => $player2->id,
    ]);

    $response = $this->actingAs($player3)->post('/rooms/join', [
        'room_code' => 'FULLROOM',
    ]);

    $response->assertSessionHasErrors('room_code');
});
