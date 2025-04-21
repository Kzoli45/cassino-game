<?php

use App\Events\MessageSent;
use App\Models\GameRoom;
use App\Models\User;
use Illuminate\Support\Facades\Event;

test('sendMessage broadcasts MessageSent event', function () {
    Event::fake();

    $user = User::factory()->create();
    $room = GameRoom::create([
        'room_code' => 'TESTROOM',
        'player1_id' => $user->id,
    ]);

    $this->actingAs($user)->postJson("/api/send-message/{$room->room_code}", [
        'message' => 'Hello, world!'
    ])->assertOk()
        ->assertJson(['message' => 'Message sent']);

    Event::assertDispatched(MessageSent::class, function ($event) use ($room, $user) {
        return $event->message === 'Hello, world!' &&
            $event->roomCode === $room->room_code &&
            $event->userId === $user->id;
    });
});
