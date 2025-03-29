<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/game/computer', [RoomController::class, 'vsComputer'])->name('vscomputer');
    Route::get('/room', [RoomController::class, 'room'])->name('room');

    Route::post('/rooms/create', [RoomController::class, 'createRoom'])->name('rooms.create');
    Route::post('/rooms/join', [RoomController::class, 'joinRoom'])->name('rooms.join');
    Route::get('/rooms/{roomCode}', [RoomController::class, 'showRoom'])->name('room.show');
    Route::get('/rooms/{roomCode}/play', [RoomController::class, 'playRoom'])->name('room.play');

    Route::post('/api/store-deck/{roomCode}', [RoomController::class, 'storeDeck']);
    Route::post('/api/deal-cards/{roomCode}', [GameController::class, 'dealCards']);
    Route::post('/api/place-card/{roomCode}', [GameController::class, 'placeCard']);
    //Route::post('/rooms/{roomCode}/ready/{player}', [GameController::class, 'readyUp'])->name('player.ready');
});

require __DIR__ . '/auth.php';
