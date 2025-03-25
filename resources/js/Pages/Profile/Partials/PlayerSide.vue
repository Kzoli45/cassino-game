<script setup>
    import Card from '@/Components/Card.vue';
    import HiddenCard from '@/Components/HiddenCard.vue';
    import PrimaryButton from '@/Components/PrimaryButton.vue';
    import TakenCards from '@/Components/TakenCards.vue';
    import { isCardRed } from '@/shared/deck';
    import { handStore } from '@/shared/playerLogic';
    import { deckStore } from '@/shared/deal';
    import { gameStore } from '@/shared/gameCycle';
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-4 w-full">
        <div v-show="handStore.wasIllegalMove">
            <p class="text-red-600 transition">Illegal move!</p>
        </div>
        <div v-if="deckStore.deck.length === 52">
            <PrimaryButton class="mb-6" @click="gameStore.newGame">
                Ready
            </PrimaryButton>
        </div>
        <div v-else-if="handStore.isLogicalMove() && gameStore.currentPlayer === 1" >
            <PrimaryButton class="mb-6" @click="gameStore.processPlayerMove" :class="{'pointer-events-none': handStore.placing === true}">
                Play Cards
            </PrimaryButton>
        </div>
        <div v-else>
            <PrimaryButton class="mb-6 opacity-0" disabled>
                Placeholder
            </PrimaryButton>
        </div>
            <div class="flex flex-row gap-4 items-center justify-between m-2 w-full">
                <TakenCards class="player-pile">
                    <Card class="opacity-0 absolute" id="template-card"/>
                    <HiddenCard v-for="card in handStore.playerTaken" :key="card.id" :card="card" :id="`taken-card-${card.id}`" class="absolute">
                        <template #back>
                            <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                            <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                        </template>
                    </HiddenCard>
                </TakenCards>
                <div class="flex flex-row flex-wrap gap-4 items-center justify-center flex-grow player-hand">
                    <div v-show="handStore.playerHand.length === 0">
                        <Card class="opacity-0"/>
                    </div>
                    <Card v-for="card in handStore.playerHand" :key="card.id" :card="card" :id="`player-card-${card.id}`" class="cursor-pointer" @click="handStore.selectCard(card)">
                        <template #front>
                            <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                            <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                        </template>
                    </Card>
                </div>
                <!-- <div v-show="gameStore.currentPlayer === 1" class="z-10 mr-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform:"><path d="m12 16 5-6H7z"></path><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>
                </div> -->
            </div>
    </div>
</template>