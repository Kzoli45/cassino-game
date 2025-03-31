import { nextTick, reactive } from "vue";
import { createDeck, shuffleDeck, createCards, getCardValue } from "@/shared/deck";
import gsap from "gsap";
import axios from "axios";

export const playRoom = reactive({
    deck: createCards(shuffleDeck(createDeck())),
    dealing: false,
    placing: false,
    capturing: false,
    wasIllegalMove: false,

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

    async animateDealing(playerHand, opponentHand, table, round) {
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
            if (round <= 1 && table[i]) {
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

    async placeCard(playerSelected, tableSelected, roomCode) {
        if (playerSelected.length === 1 && tableSelected.length === 0) {
            const card = playerSelected[0];

            await axios.post(`/api/place-card/${roomCode}`, {
                card: card,
            })
        }
    },

    async captureCards(playerSelected, tableSelected, roomCode) {
        if (playRoom.isLegalMove(playerSelected, tableSelected)) {
            await axios.post(`/api/capture-cards/${roomCode}`, {
                playerCards: playerSelected,
                tableCards: tableSelected,
            })

        }
        else {
            playRoom.wasIllegalMove = true;
            setTimeout(() => {
                playRoom.wasIllegalMove = false;
            }, 1000);
        }
    },

    playerMove(playerSelected, tableSelected, roomCode) {
        if (playRoom.isLogicalMove(playerSelected, tableSelected)) {
            if (playerSelected.length === 1 && tableSelected.length === 0) {
                playRoom.placeCard(playerSelected, tableSelected, roomCode);
            }
            else {
                playRoom.captureCards(playerSelected, tableSelected, roomCode);
            }
        }
    },

    async placeCardAnimation(card, hand, table, shouldFlip) {
        await nextTick();

        playRoom.placing = true;

        const selectedCard = card;
        const cardElement = document.getElementById(`${hand}-${selectedCard.id}`);
        const cardInner = cardElement.querySelector('.card-inner');
    
        if (cardElement) {
            const tableElement = document.querySelector('.table-hand');
            const tableCards = tableElement.querySelectorAll('.card:not(.opacity-0)');
            let targetX, targetY;
    
                if (table.length > 0) {
                    const lastTableCard = tableCards[tableCards.length - 1];
                    const lastCardRect = lastTableCard.getBoundingClientRect();
                    const tableRect = tableElement.getBoundingClientRect();
                    const gap = 16;
    
                    targetX = lastCardRect.right - tableRect.left + gap;
                    targetY = lastCardRect.top - tableRect.top;
                } else {
                    targetX = 0;
                    targetY = 0;
                }
    
                const cardRect = cardElement.getBoundingClientRect();
                const tableRect = tableElement.getBoundingClientRect();
    
                const deltaX = targetX - (cardRect.left - tableRect.left);
                const deltaY = targetY - (cardRect.top - tableRect.top);

                gsap.set(cardInner, { rotateY: shouldFlip? -180 : 0, duration: 0.6, delay: 0.1 });

                gsap.to(cardElement, {
                    x: deltaX,
                    y: deltaY,
                    duration: 0.6,
                    ease: "power2.inOut",
                    onComplete: () => {
                        nextTick(() => {
                            playRoom.placing = false;
                        })
                    }
                })
            }
    },

    async captureCardsAnimation(playerSelected, tableSelected, hand, shouldFlip) {
        const playerCards = playerSelected;
        const tableCards = tableSelected;

        playRoom.capturing = true

        const cardsToAnimate = [
            ...playerCards.map(card => `#${hand}-${card.id}`),
            ...tableCards.map(card => `#table-card-${card.id}`)
        ]

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
    
        const templateCard = document.querySelector('#template-card');
        const templateRect = templateCard.getBoundingClientRect();
        const templateCenterX = templateRect.left + templateRect.width / 2;
        const templateCenterY = templateRect.top + templateRect.height / 2;
    
        const templateX = templateCenterX - centerX;
        const templateY = templateCenterY - centerY;

        const overlay = playRoom.createOverlay();
        document.body.appendChild(overlay);

        const timeline = gsap.timeline({
            onStart: () => {
                gsap.set(overlay, { opacity: 1, duration: 0.3 });
            },
            onComplete: () => {
                gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => {
                    overlay.remove();
                    nextTick(() => {
                        playRoom.capturing = false;
                    })
                }});
            }
        })

        cardsToAnimate.forEach(selector => {
            //console.log(selector)
            const cardElement = document.querySelector(selector);
            if (!cardElement) return;

            const cardRect = cardElement.getBoundingClientRect();
            const currentX = cardRect.left + cardRect.width / 2;
            const currentY = cardRect.top + cardRect.height / 2;
    
            const deltaXToCenter = centerX - currentX;
            const deltaYToCenter = centerY - currentY;

            if (selector.includes(hand)) {
                const inner = cardElement.querySelector('.card-inner');
                gsap.set(inner, { rotateY: shouldFlip ? -180 : 0, duration: 0.2 });
            }

            gsap.set(cardElement, { zIndex: 100, pointerEvents: 'none' });

            timeline.to(cardElement, {
                x: `+=${deltaXToCenter}`,
                y: `+=${deltaYToCenter}`,
                scale: 1.5,
                duration: 0.5,
                ease: "power2.inOut"
            });
        })

        timeline.to(cardsToAnimate.map(selector => document.querySelector(selector)), {
            x: `+=${templateX}`,
            y: `+=${templateY}`,
            scale: 1,
            duration: 0.7,
            ease: "power2.inOut",
            onStart: () => {
                cardsToAnimate.forEach(selector => {
                    const cardElement = document.querySelector(selector);
                    //console.log(cardElement)
                    const inner = cardElement.querySelector('.card-inner');
                    if (inner) {
                        gsap.to(inner, { rotateY: 180, duration: 0.2, ease: "power1.inOut" });
                    }
                }
            )},

            onComplete: () => {
                cardsToAnimate.forEach(selector => {
                    const cardElement = document.querySelector(selector);
                    if (cardElement) {
                        gsap.set(cardElement, { zIndex: 0 });
                    }
                });
            }
        });

    },

    createOverlay() {
        const overlay = document.createElement('div');
            overlay.id = 'dim-overlay';
            Object.assign(overlay.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: '50',
                pointerEvents: 'auto',
                opacity: '0'
            });

        return overlay;
    },
});

