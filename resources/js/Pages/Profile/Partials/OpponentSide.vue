<script setup>
    import HiddenCard from '@/Components/HiddenCard.vue';
    import Card from '@/Components/Card.vue';
    import TakenCards from '@/Components/TakenCards.vue';
    import {isCardRed } from '@/shared/deck';
    import { handStore } from '@/shared/playerLogic';
    import { gameStore } from '@/shared/gameCycle';
</script>

<template>
    <div class="flex flex-row gap-4 items-center justify-between m-2 w-full">
        <TakenCards class="opponent-pile">
            <Card class="opacity-0 absolute" id="opponent-template-card"/>
            <HiddenCard v-for="card in handStore.opponentTaken" :key="card.id" :card="card" :id="`taken-card-${card.id}`" class="absolute">
                <template #back>
                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                </template>
            </HiddenCard>
        </TakenCards>
        <div class="flex flex-row flex-wrap gap-4 items-center justify-center flex-grow opponent-hand">
            <div v-show="handStore.opponentHand.length === 0">
                <HiddenCard class="opacity-0"/>
            </div>
            <template v-if="gameStore.round < 8">
                <HiddenCard v-for="card in handStore.opponentHand" :key="card.id" :card="card" :id="`opponent-card-${card.id}`">
                    <template #back>
                        <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                        <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                    </template>
                </HiddenCard>
            </template>
            <template v-else>
                <Card v-for="card in handStore.opponentHand" :key="card.id" :card="card" :id="`opponent-card-${card.id}`">
                    <template #front>
                        <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                        <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                    </template>
                </Card>
            </template>
        </div>
    </div>
</template>