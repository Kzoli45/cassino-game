<?php

use App\Models\User;

test('vs computer page is displayed', function () {

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/game/computer');

    $response->assertOk();
});

test('room page is displayed', function () {

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/room');

    $response->assertOk();
});
