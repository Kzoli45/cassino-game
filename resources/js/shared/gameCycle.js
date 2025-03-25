import {nextTick, reactive, watch} from "vue";
import { handStore } from "./playerLogic";
import { computerStore } from "./computerLogic";
import { deckStore } from "./deal";
import gsap from "gsap";

export const gameStore = reactive({
    currentPlayer: 0, // 1 = player, 2 = computer
    lastToCapture: 0,
    round: 0,
    isGameOver: false,
    assigningCards: false,
    result: {
        playerCards: 0,
        opponentCards: 0,
        playerSpades: 0,
        opponentSpades: 0,
        tenOfDiamonds: 0,
        twoOfSpades: 0,
        playerAces: 0,
        opponentAces: 0,
        playerTables: 0,
        opponentTables: 0,
        playerTotal: 0,
        opponentTotal: 0,
        winner: 0
    },

    getRoundStarter() {
        if (gameStore.round === 1) {
            return Math.floor(Math.random() * 2) + 1;
            
        }
        else {
            return gameStore.lastToCapture;
        }
    },

    async startNewRound() {
        if (gameStore.isGameOver) return;

        gameStore.round++;
        gameStore.currentPlayer = gameStore.getRoundStarter();
        await handStore.dealCards();
        
        watch(() => handStore.dealing, (newVal) => {
            if (!newVal) {
                gameStore.nextTurn();
            }
        }, { immediate: true });
    },

    nextTurn() {
        if (gameStore.isGameOver) return;

        console.log('current player:', gameStore.currentPlayer);
        console.log('lastToCapture:', gameStore.lastToCapture);
        console.log('opponent hand:', handStore.opponentHand);
        console.log('playerhand', handStore.playerHand);

        if (gameStore.currentPlayer === 2 && handStore.dealing) return;

        if (gameStore.currentPlayer === 2) {
            gameStore.processComputerMove();
        }
    },

    processPlayerMove() {
        if (gameStore.currentPlayer !== 1) return;

        handStore.playerMove();
        //gameStore.changeCurrentPlayer(handStore.opponentHand);

        //gameStore.nextTurn();
    },

    processComputerMove() {
        computerStore.computerMove();
        //gameStore.changeCurrentPlayer(handStore.playerHand);

        //gameStore.nextTurn();
    },

    changeCurrentPlayer(changeToHand) {
        if (changeToHand.length !== 0) {
            gameStore.currentPlayer = gameStore.currentPlayer === 1 ? 2 : 1;
        }
    },

    checkRoundOver() {
        if (handStore.playerHand.length === 0 && handStore.opponentHand.length === 0) {
            console.log('Round over');
            if (deckStore.deck.length !== 0) {
                gameStore.currentPlayer = 0;
                gameStore.startNewRound();
            } else {
                gameStore.assignRemainingCards();
                watch(() => gameStore.assigningCards, (newVal) => {
                    if (!newVal) {
                        gameStore.getResult();
                        console.log(gameStore.result);
                        gameStore.endGame();
                    }
                }, { immediate: false });
                console.log(handStore.playerTaken);
                console.log(handStore.opponentTaken);
            }
            return true;
        }
        return false; 
    },

    getResult() {
        gameStore.result.playerCards = gameStore.countCards()[0];
        gameStore.result.opponentCards = gameStore.countCards()[1];
        gameStore.result.playerSpades = gameStore.countSpades()[0];
        gameStore.result.opponentSpades = gameStore.countSpades()[1];
        gameStore.result.tenOfDiamonds = gameStore.findTenOfDiamonds();
        gameStore.result.twoOfSpades = gameStore.findTwoOfSpades();
        gameStore.result.playerAces = gameStore.countAces()[0];
        gameStore.result.opponentAces = gameStore.countAces()[1];
        gameStore.result.playerTotal = gameStore.result.playerAces + gameStore.result.playerTables;
        gameStore.result.opponentTotal = gameStore.result.opponentAces + gameStore.result.opponentTables;

        if (gameStore.result.playerCards > gameStore.result.opponentCards) {
            gameStore.result.playerTotal += 3;
        }
        else if (gameStore.result.playerCards < gameStore.result.opponentCards) {
            gameStore.result.opponentTotal += 3;
        }

        if (gameStore.result.playerSpades > gameStore.result.opponentSpades) {
            gameStore.result.playerTotal += 2;
        }
        else if (gameStore.result.playerSpades < gameStore.result.opponentSpades) {
            gameStore.result.opponentTotal += 2;
        }

        if (gameStore.result.tenOfDiamonds === 1) {
            gameStore.result.playerTotal += 2;
        }
        else if (gameStore.result.tenOfDiamonds === 2) {
            gameStore.result.opponentTotal += 2;
        }

        if (gameStore.result.twoOfSpades === 1) {
            gameStore.result.playerTotal += 1;
        }
        else if (gameStore.result.twoOfSpades === 2) {
            gameStore.result.opponentTotal += 1;
        }

        if (gameStore.result.playerTotal > gameStore.result.opponentTotal) {
            gameStore.result.winner = 1;
        }
        else if (gameStore.result.playerTotal < gameStore.result.opponentTotal) {
            gameStore.result.winner = 2;
        }
        else {
            gameStore.result.winner = 0;
        }
    },

    countCards() {
        let playerCards = handStore.playerTaken.length;
        let opponentCards = handStore.opponentTaken.length;

        return [playerCards, opponentCards];
    },

    countSpades() {
        let playerSpades = handStore.playerTaken.filter(card => card.suit === '♠').length;
        let opponentSpades = handStore.opponentTaken.filter(card => card.suit === '♠').length;

        return [playerSpades, opponentSpades];
    },

    findTenOfDiamonds() {
        let owner = 0;
        let playerHand = handStore.playerTaken;
        let opponentHand = handStore.opponentTaken;

        playerHand.forEach(card => {
            if (card.value === '10' && card.suit === '♦') {
                owner = 1;
            }
        });

        opponentHand.forEach(card => {
            if (card.value === '10' && card.suit === '♦') {
                owner = 2;
            }
        });

        return owner;
    },

    findTwoOfSpades() {
        let owner = 0;
        let playerHand = handStore.playerTaken;
        let opponentHand = handStore.opponentTaken;

        playerHand.forEach(card => {
            if (card.value === '2' && card.suit === '♠') {
                owner = 1;
            }
        });

        opponentHand.forEach(card => {
            if (card.value === '2' && card.suit === '♠') {
                owner = 2;
            }
        });

        return owner;
    },

    countAces() {
        let playerAces = handStore.playerTaken.filter(card => card.value === 'A').length;
        let opponentAces = handStore.opponentTaken.filter(card => card.value === 'A').length;

        return [playerAces, opponentAces];
    },

    newGame() {
        gameStore.isGameOver = false;
        gameStore.round = 0;
        gameStore.currentPlayer = 0;
        gameStore.lastToCapture = 0;
        handStore.playerTaken = [];
        handStore.opponentTaken = [];

        Object.keys(gameStore.result).forEach(key => {
            gameStore.result[key] = 0;
        });

        deckStore.resetDeck();
        gameStore.startNewRound();
    },

    endGame() {
        gameStore.isGameOver = true;
    },

    assignRemainingCards() {
            const cards = handStore.table;

            if (cards.length === 0) return;

            const cardsToAnimate = [
                ...cards.map(card => `#table-card-${card.id}`)
            ]

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
    
            const templateCard = gameStore.lastToCapture === 1 ? document.querySelector('#template-card') : document.querySelector('#opponent-template-card');
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
                    gameStore.assigningCards = true;
            },

            onComplete: () => {
                if (gameStore.lastToCapture === 1) {
                    cards.forEach(card => {
                        handStore.table = handStore.table.filter(c => c.id !== card.id);
                        handStore.playerTaken.push(card);
                    });
                }
                else {
                    cards.forEach(card => {
                        handStore.table = handStore.table.filter(c => c.id !== card.id);
                        handStore.opponentTaken.push(card);
                    });
                }

                gameStore.assigningCards = false;
                gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });
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
    });