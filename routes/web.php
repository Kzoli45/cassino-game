<?php

use App\Http\Controllers\GameController;
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

    Route::get('/game/computer', [GameController::class, 'vsComputer'])->name('vscomputer');
    Route::get('/room', [GameController::class, 'room'])->name('room');

    Route::post('/rooms/create', [GameController::class, 'createRoom'])->name('rooms.create');
    Route::post('/rooms/join', [GameController::class, 'joinRoom'])->name('rooms.join');
    Route::get('/rooms/{roomCode}', [GameController::class, 'showRoom'])->name('room.show');
    Route::get('/rooms/{roomCode}/play', [GameController::class, 'playRoom'])->name('room.play');
});

require __DIR__ . '/auth.php';
