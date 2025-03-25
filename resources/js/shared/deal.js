import { reactive } from 'vue';
import { createDeck, shuffleDeck, createCards } from '@/shared/deck';

export const deckStore = reactive({
    deck: createCards(shuffleDeck(createDeck())),

    dealCards(numCards) {
        let cards = [];
        for (let i = 0; i < numCards; i++) {
            if (this.deck.length === 0) break;
            let randomIndex = Math.floor(Math.random() * this.deck.length);
            cards.push(this.deck.splice(randomIndex, 1)[0]);
        }
        return cards;
    },

    resetDeck() {
        deckStore.deck = createCards(shuffleDeck(createDeck()));
    }
});

