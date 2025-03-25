<script setup>
    import GameScene from './Profile/Partials/GameScene.vue';
    import EndScene from './Profile/Partials/EndScene.vue';
    import { gameStore } from '@/shared/gameCycle';
</script>

<template>
        <template v-if="gameStore.isGameOver">
            <EndScene />
        </template>
        <template v-else>
            <GameScene />
        </template>
</template>