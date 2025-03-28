<script setup>
import { defineProps, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { playRoom } from '@/shared/playroom';
import axios from 'axios';

const props = defineProps({
    room: Object,
})

let room = ref(props.room);

window.Echo.channel('room.' + props.room.room_code)
    .listen('PlayerJoinedRoom', (e) => {
        room.value = e.room;
    });

watch(() => room.value, async(newRoom) => {
        if (newRoom.player1 && newRoom.player2) {

            if (!localStorage.getItem(`deck-${newRoom.room_code}`)) {
            let deck = JSON.stringify(playRoom.deck);

            await axios.post(`/api/store-deck/${newRoom.room_code}`, { deck });

            localStorage.setItem(`deck-${newRoom.room_code}`, 'true');
        }

            setTimeout(() => {
                router.visit(`/rooms/${newRoom.room_code}/play`);
            }, 2000);
        }
    },
    {
        deep: true,
        immediate: true
    }
);

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
}
</script>

<template>
    <div class="relative w-full max-w-2xl px-6 lg:max-w-7xl items-center justify-center flex flex-col min-h-screen">
        <main class="mt-6 mb-6">
            <div class="justify-center items-center">
                <div class="dark:bg-slate-800 p-8 justify-center items-center flex flex-col gap-4 rounded-lg">
                    <div class="flex flex-col gap-4 w-full">
                        <p :class="room.player1_id ? 'text-white' : 'text-gray-400'">Player 1: {{ room.player1_id ? `${room.player1.name} is ready!` : 'Waiting for player to join..' }}</p>
                        <p :class="room.player2_id ? 'text-white' : 'text-gray-400'">Player 2: {{ room.player2_id ? `${room.player2.name} is ready!` : 'Waiting for a player to join..' }}</p>
                    </div>
                        <div v-if="!(room.player1 && room.player2)" class="flex flex-row gap-2 mt-4">
                            <h1 class="text-white">
                                Click the room code to copy it:
                            </h1>
                            <h1 class="text-white">
                                <span @click="copyToClipboard(room.room_code)" class="cursor-pointer underline">{{room.room_code }}</span>
                            </h1>
                        </div>
                        <div v-if="room.player1 && room.player2" class="flex text-green-500">
                            Game is starting...
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>