<script setup>
    import Card from '@/Components/Card.vue';
    import { isCardRed } from '@/shared/deck';
    import { handStore } from '@/shared/playerLogic';
    import Deck from './Deck.vue';
    import { gameStore } from '@/shared/gameCycle';

</script>

<template>
    <div class="flex flex-row gap-4 items-center justify-between m-2 w-full">
        <div v-show="gameStore.round > 0" class="flex flex-row gap-2 md:gap-4 items-center justify-center text-xs md:text-lg">
            <h1 class="text-white ml-6 mr-0">Round {{ gameStore.round }}</h1>
            <div v-show="gameStore.currentPlayer === 1">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform:"><path d="m12 16 5-6H7z"></path><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>
            </div>
            <div v-show="gameStore.currentPlayer === 2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform:"><path d="M7 14h10l-5-6z"></path><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>
            </div>
        </div>
        <div class="flex flex-row flex-wrap gap-4 items-center justify-center flex-grow table-hand">
            <div v-show="handStore.table.length === 0">
                <Card class="placeholder opacity-0"/>
            </div>
            <Card v-for="card in handStore.table" :key="card.id" :card="card" :id="`table-card-${card.id}`" class="cursor-pointer" @click="handStore.selectCard(card)">
                <template #front>
                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                </template>
            </Card>
        </div>
        <Deck />
    </div>
</template>
