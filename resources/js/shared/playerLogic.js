import { reactive, nextTick } from 'vue';
import { createCards, getCardValue } from '@/shared/deck';
import { deckStore } from '@/shared/deal';
import { gameStore } from './gameCycle';
import gsap from 'gsap';

export const handStore = reactive({
    playerHand: [],
    opponentHand: [],
    table: [],
    playerSelected: [],
    tableSelected: [],
    playerTaken: [],
    opponentTaken: [],
    wasIllegalMove: false,
    dealing: false,
    placing: false,

    async dealCards() {
        await nextTick();
    
        const deckCards = document.querySelectorAll("#deck .card");
        const lastCard = deckCards[deckCards.length - 1];
    
        if (!lastCard) return;
    
        const deckRect = lastCard.getBoundingClientRect();

        const isFirstRound = gameStore.round === 1;
        const playerCards = createCards(deckStore.dealCards(3));
        const opponentCards = createCards(deckStore.dealCards(3));
        const tableCards = isFirstRound ? createCards(deckStore.dealCards(4)) : handStore.table;
        handStore.playerHand = [];
        handStore.opponentHand = [];
        handStore.table = [];

        handStore.dealing = true;

        await nextTick();
    
        handStore.playerHand = playerCards;
        handStore.opponentHand = opponentCards;
        handStore.table = tableCards;
    
        await nextTick();
    
        const dealingOrder = [];
        const maxRounds = Math.max(handStore.playerHand.length, handStore.opponentHand.length, handStore.table.length);
    
        for (let i = 0; i < maxRounds; i++) {
            if (isFirstRound && handStore.table[i]) {
                dealingOrder.push({ selector: `#table-card-${handStore.table[i].id}`, shouldFlip: true });
            }
            if (handStore.playerHand[i]) {
                dealingOrder.push({ selector: `#player-card-${handStore.playerHand[i].id}`, shouldFlip: true });
            }
            if (handStore.opponentHand[i]) {
                dealingOrder.push({ selector: `#opponent-card-${handStore.opponentHand[i].id}`, shouldFlip: gameStore.round < 8? false : true });
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
                    handStore.dealing = false;
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
                    duration: 0.05,
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
    

    isLogicalMove() { 
        let logical = false;
        if (handStore.playerSelected.length === 1 && handStore.tableSelected.length === 0 || handStore.playerSelected.length > 0 && handStore.tableSelected.length > 0) {
            logical = true;
        }
        //console.log('Logical:', logical);
        return logical;
    },

    isLegalMove(arrA, arrB) {
        let legal = false;
        let sumA = arrA.reduce((acc, card) => acc + getCardValue(card), 0);
        let sumB = arrB.reduce((acc, card) => acc + getCardValue(card), 0);

        if (sumA === sumB && sumA !== 0 && sumA <= 13) {
            legal = true;
        }
        //console.log('Legal:', legal);
        //console.log('Sum A:', sumA);
        //console.log('Sum B:', sumB);
        return legal;
    },  

    selectCard(card) {
        let cardElement = document.getElementById(`player-card-${card.id}`);
        if (!cardElement) {
            cardElement = document.getElementById(`table-card-${card.id}`);
        }
    
        if (cardElement) {
            this.selectAnimation(cardElement, () => {
                //console.log('Player selected:', handStore.playerSelected);
                //console.log('Table selected:', handStore.tableSelected);
            }
        )}
    },

    selectAnimation(card, callback) {
        if (card.classList.contains('selected')) {
            gsap.to(card, { 
                y: 0, 
                duration: 0.3, 
                ease: "power2.out", 
                onComplete: () => {
                    card.classList.remove('selected');
                    if (card.closest('.table-hand')) {
                        const cardId = card.id.split('-')[2];
                        handStore.tableSelected = handStore.tableSelected.filter(c => c.id !== cardId); 
                    } else {
                        const cardId = card.id.split('-')[2];
                        handStore.playerSelected = handStore.playerSelected.filter(c => c.id !== cardId);
                    }
                    if (callback) callback();
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
                        const matchedCard = handStore.table.find(c => c.id === cardId);
                        handStore.tableSelected.push(matchedCard);
                    } else {
                        const cardId = card.id.split('-')[2];
                        const matchedCard = handStore.playerHand.find(c => c.id === cardId);
                        handStore.playerSelected.push(matchedCard);
                    }
                    if (callback) callback();
                }
            });
        }
    },

    placeCard() {
        if (handStore.playerSelected.length === 1 && handStore.tableSelected.length === 0) {
            const selectedCard = handStore.playerSelected[0];
            const cardElement = document.getElementById(`player-card-${selectedCard.id}`);
    
            if (cardElement) {
                const tableElement = document.querySelector('.table-hand');
                const tableCards = tableElement.querySelectorAll('.card:not(.opacity-0)');
                let targetX, targetY;
    
                if (tableCards.length > 0) {
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

                gsap.to(cardElement, {
                    x: deltaX,
                    y: deltaY,
                    duration: 0.6,
                    ease: "power2.inOut",
                    onStart: () => {
                        handStore.placing = true;
                    },
                    onComplete: () => {
                        handStore.playerHand = handStore.playerHand.filter(c => c.id !== selectedCard.id);
                        handStore.table.push(selectedCard);
    
                        handStore.playerSelected = [];
                        handStore.tableSelected = [];

                        nextTick(() => {
                            handStore.placing = false;
                            if (!gameStore.checkRoundOver() && !gameStore.isGameOver) {
                                gameStore.changeCurrentPlayer(handStore.opponentHand);
                                gameStore.nextTurn();
                            }
                        });
                    }
                });
            }
        }
    },
    
    captureCards() {
        if (handStore.isLegalMove(handStore.playerSelected, handStore.tableSelected)) {
            const playerSelected = handStore.playerSelected;
            const tableSelected = handStore.tableSelected;
    
            const cardsToAnimate = [
                ...tableSelected.map(card => `#table-card-${card.id}`),
                ...playerSelected.map(card => `#player-card-${card.id}`)
            ];
    
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
    
            const templateCard = document.querySelector('#template-card');
            const templateRect = templateCard.getBoundingClientRect();
            const templateCenterX = templateRect.left + templateRect.width / 2;
            const templateCenterY = templateRect.top + templateRect.height / 2;
    
            const templateX = templateCenterX - centerX;
            const templateY = templateCenterY - centerY;

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
            document.body.appendChild(overlay);
    
            const timeline = gsap.timeline({
                onStart: () => {
                    gsap.to(overlay, { opacity: 1, duration: 0.3 });
                },
                onComplete: () => {
                    let handBefore = handStore.playerHand;

                    playerSelected.forEach(card => {
                        handStore.playerHand = handStore.playerHand.filter(c => c.id !== card.id);
                        handStore.playerTaken.push(card);
                    });
    
                    tableSelected.forEach(card => {
                        handStore.table = handStore.table.filter(c => c.id !== card.id);
                        handStore.playerTaken.push(card);
                    });

                    let handAfter = handStore.playerHand;
    
                    handStore.playerSelected = [];
                    handStore.tableSelected = [];
                    
                    gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });

                    nextTick(() => {
                        if (handBefore.length !== handAfter.length) {

                            if (handStore.table.length === 0) {
                                gameStore.result.playerTables += 1;
                            }

                            if (!gameStore.checkRoundOver() && !gameStore.isGameOver) {
                                gameStore.changeCurrentPlayer(handStore.opponentHand);
                                gameStore.nextTurn();
                            }
                        }
                    }); 

                    //console.log('Player taken:', handStore.playerTaken);
                    //console.log('Player hand:', handStore.playerHand);
                    //console.log('Table:', handStore.table);
                }
            });

            cardsToAnimate.forEach(selector => {
                const cardElement = document.querySelector(selector);
                if (!cardElement) return;
    
                const cardRect = cardElement.getBoundingClientRect();
                const currentX = cardRect.left + cardRect.width / 2;
                const currentY = cardRect.top + cardRect.height / 2;
    
                const deltaXToCenter = centerX - currentX;
                const deltaYToCenter = centerY - currentY;

                gsap.set(cardElement, { zIndex: 100, pointerEvents: 'none' });
    
                timeline.to(cardElement, {
                    x: `+=${deltaXToCenter}`,
                    y: `+=${deltaYToCenter}`,
                    scale: 1.5,
                    duration: 0.5,
                    ease: "power2.inOut"
                });
            });
    
            timeline.to(cardsToAnimate.map(selector => document.querySelector(selector)), {
                x: `+=${templateX}`,
                y: `+=${templateY}`,
                scale: 1,
                duration: 0.7,
                ease: "power2.inOut",
                onStart: () => {
                    cardsToAnimate.forEach(selector => {
                        const cardElement = document.querySelector(selector);
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
        }

        else {
            handStore.wasIllegalMove = true;
            console.log(handStore.wasIllegalMove);
            setTimeout(() => {
                handStore.wasIllegalMove = false;
                console.log(handStore.wasIllegalMove);
            }, 2000);
        }
    },
        
    playerMove() {
        if (handStore.isLogicalMove()) {
            if (handStore.playerSelected.length === 1 && handStore.tableSelected.length === 0) {
                handStore.placeCard();
            } else {
                handStore.captureCards();
                gameStore.lastToCapture = 1;
            }
        }

        //console.log(gameStore.lastToCapture);
    }
});
