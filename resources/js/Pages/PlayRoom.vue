<script setup>
import { defineProps, ref } from 'vue'; 

const props = defineProps({
    room: Object,
})

</script>

<template>
    <div class="bg-slate-600 flex flex-row items-center justify-center h-screen w-full my-4">
        <div class="bg-slate-800 flex flex-col items-center justify-center gap-12 w-[90%] m-4 rounded-lg">
            <div class="flex flex-row justify-center items-center gap-4 h-screen text-white">
                <h1>{{ room.player1.name }}</h1>
                <h1>{{ room.player2.name }}</h1>
            </div>
        </div>
    </div>
</template>