import { nextTick, reactive } from "vue";
import { createDeck, shuffleDeck, createCards } from "@/shared/deck";
import gsap from "gsap";

export const playRoom = reactive({
    deck: createCards(shuffleDeck(createDeck())),
    dealing: false,

    dealCards(numCards) {
        let cards = [];
        for (let i = 0; i < numCards; i++) {
            if (this.deck.length === 0) break;
            let randomIndex = Math.floor(Math.random() * this.deck.length);
            cards.push(this.deck.splice(randomIndex, 1)[0]);
        }
        return cards;
    },

    resetDeck () {
        playRoom.deck = createCards(shuffleDeck(createDeck()));
    },

    async animateDealing(playerHand, opponentHand, table) {
        await nextTick();

        const deckCards = document.querySelectorAll("#deck .card");
        const lastCard = deckCards[deckCards.length - 1];
        if (!lastCard) return;

        const deckRect = lastCard.getBoundingClientRect();

        playRoom.dealing = true;

        await nextTick();

        const dealingOrder = [];
        const maxRounds = Math.max(playerHand.length, opponentHand.length, table.length);

        for (let i = 0; i < maxRounds; i++) {
            if (table[i]) {
                dealingOrder.push({ selector: `#table-card-${table[i].id}`, shouldFlip: true });
            }
            if (playerHand[i]) {
                dealingOrder.push({ selector: `#player-card-${playerHand[i].id}`, shouldFlip: true });
            }
            if (opponentHand[i]) {
                dealingOrder.push({ selector: `#opponent-card-${opponentHand[i].id}`, shouldFlip: false });
            }
        }

        dealingOrder.forEach((entry) => {
            const cardElement = document.querySelector(entry.selector);
            if (cardElement) {
                const inner = cardElement.querySelector('.card-inner');
                gsap.set(entry.selector, { opacity: 0 });

                if (entry.shouldFlip && inner) {
                    gsap.set(inner, { rotateY: 180 });
                }
            }
        });

        const tl = gsap.timeline({
            onComplete: () => {
                setTimeout(() => {
                    playRoom.dealing = false;
                    console.log("Dealing finished!");
                }, 500);
            }
        });

        dealingOrder.forEach((entry) => {
            const cardElement = document.querySelector(entry.selector);
            if (cardElement) {
                const inner = cardElement.querySelector('.card-inner');
                const cardRect = cardElement.getBoundingClientRect();
                const finalX = deckRect.left - cardRect.left;
                const finalY = deckRect.top - cardRect.top;

                tl.to(entry.selector, {
                    x: finalX,
                    y: finalY,
                    opacity: 0,
                    duration: 0,
                })
                .to(entry.selector, {
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.2,
                    delay: 0.2,
                    ease: "power2.out",
                    rotation: 720,
                    onComplete: () => {
                        if (entry.shouldFlip && inner) {
                            gsap.to(inner, { rotateY: 0, duration: 0.1, ease: "power1.out" });
                        }
                    }
                }, "+=0.1");
            }
        });
    },

    isLogicalMove(playerSelected, tableSelected) {
        let isLogical = false;
        if (playerSelected.length === 1 && tableSelected.length === 0 || playerSelected.length > 0 && tableSelected.length > 0) {
            isLogical = true;
        }

        return isLogical;
    },

    isLegalMove(arrA, arrB) {
        let isLegal = false;
        let sumA = arrA.reduce((acc, card) => acc + getCardValue(card), 0);
        let sumB = arrB.reduce((acc, card) => acc + getCardValue(card), 0);
    
        if (sumA === sumB && sumA !== 0 && sumA <= 13) {
            isLegal = true;
        }
        return isLegal;
    },

    selectAnimation(card, playerSelected, tableSelected, playerHand, table, callback) {
        if (card.classList.contains('selected')) {
            gsap.to(card, { 
                y: 0, 
                duration: 0.3, 
                ease: "power2.out", 
                onComplete: () => {
                    card.classList.remove('selected');
                    if (card.closest('.table-hand')) {
                        const cardId = card.id.split('-')[2];
                        tableSelected.value = tableSelected.value.filter(c => c.id !== cardId); 
                    } else {
                        const cardId = card.id.split('-')[2];
                        playerSelected.value = playerSelected.value.filter(c => c.id !== cardId);
                    }
                }
            });
        } else {
            gsap.to(card, { 
                y: -20, 
                duration: 0.3, 
                ease: "power2.out", 
                onComplete: () => {
                    card.classList.add('selected');
                    if (card.closest('.table-hand')) {
                        const cardId = card.id.split('-')[2];
                        const matchedCard = table.find(c => c.id === cardId);
                        tableSelected.value.push(matchedCard);
                    } else {
                        const cardId = card.id.split('-')[2];
                        const matchedCard = playerHand.find(c => c.id === cardId);
                        playerSelected.value.push(matchedCard);
                    }
                    if (callback) callback();
                }
            });
        }
    },
});

