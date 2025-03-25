<script setup>
    import HiddenCard from '@/Components/HiddenCard.vue';
    import {isCardRed } from '@/shared/deck';
    import { deckStore } from '@/shared/deal';
</script>

<template>
    <div class="flex flex-row items-center justify-end ml-12 mr-8 md:mx-8" id="deck">
        <HiddenCard v-for="(card, index) in deckStore.deck" :key="index" :card="card" class="absolute">
            <template #back>
                <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
            </template>
        </HiddenCard>
    </div>
</template>