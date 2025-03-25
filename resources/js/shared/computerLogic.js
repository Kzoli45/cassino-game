import { reactive, nextTick } from 'vue';
import { handStore } from './playerLogic';
import { getCardValue } from './deck';
import gsap from 'gsap';
import { gameStore } from './gameCycle';

export const computerStore = reactive({
    capturing: false,
    placingCard: false,

    placeCard() {
        if (!handStore.opponentHand.length) return;

        let validCards = handStore.opponentHand.filter(card => card.suit !== '♠');

        if (validCards.length === 0) {
            validCards = handStore.opponentHand;
        }

        const bestCard = validCards.reduce((a, b) => getCardValue(a) < getCardValue(b) ? a : b);

        nextTick(() => {
            const cardElement = document.getElementById(`opponent-card-${bestCard.id}`);
            if (!cardElement) return;
            
            const inner = cardElement.querySelector('.card-inner');
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

            gsap.set(inner, {rotateY: gameStore.round < 8? -180 : 0, duration: 0.6, delay: 0.1});

            gsap.to(cardElement, {
                x: deltaX,
                y: deltaY,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    handStore.opponentHand = handStore.opponentHand.filter(c => c.id !== bestCard.id);
                    handStore.table.push(bestCard);

                    nextTick(() => {
                        computerStore.placingCard = false;

                        if (!gameStore.checkRoundOver() && !gameStore.isGameOver) {
                            gameStore.changeCurrentPlayer(handStore.playerHand);
                            gameStore.nextTurn();
                        }
                    });
                }
            });
        });
    },

    captureCards() {
      const A = handStore.table.map(card => ({
          id: card.id,
          value: getCardValue(card),
          card: card
      }));
  
      const B = handStore.opponentHand.map(card => ({
          id: card.id,
          value: getCardValue(card),
          card: card
      }));
  
      const valuesA = A.map(c => c.value);
      const valuesB = B.map(c => c.value);
  
      const result = computerStore.findCombinations(valuesA, valuesB);
  
      if (result) {
          const [combA, combB] = result;
  
          const cardsToMove = [];
  
          combA.forEach(value => {
              const index = A.findIndex(c => c.value === value);
              if (index !== -1) {
                  cardsToMove.push(A[index].card);
                  A.splice(index, 1);
              }
          });
  
          combB.forEach(value => {
              const index = B.findIndex(c => c.value === value);
              if (index !== -1) {
                  cardsToMove.push(B[index].card);
                  B.splice(index, 1);
              }
          });

          computerStore.animateCapture(cardsToMove);
      }
  },

  animateCapture(cardsToMove) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const templateCard = document.querySelector('#opponent-template-card');
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
            cardsToMove.forEach(card => {
                handStore.opponentTaken.push(card);
            });

            handStore.opponentHand = handStore.opponentHand.filter(c => !cardsToMove.includes(c));
            handStore.table = handStore.table.filter(c => !cardsToMove.includes(c));

            gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });

            nextTick(() => {
                computerStore.capturing = false;

                if (handStore.table.length === 0) {
                    gameStore.result.opponentTables += 1;
                }

                if (!gameStore.checkRoundOver() && !gameStore.isGameOver) {
                    gameStore.changeCurrentPlayer(handStore.playerHand);
                    gameStore.nextTurn();
                }
            });
        }
    });

    cardsToMove.forEach(card => {
        const selector = `#opponent-card-${card.id}`;
        const cardElement = document.querySelector(selector);
        const inner = cardElement?.querySelector('.card-inner');
        
        gsap.set(inner, { rotateY: gameStore.round < 8? -180 : 0, duration: 0.2 });
    });

    cardsToMove.forEach(card => {
        const selector = handStore.opponentHand.includes(card) 
            ? `#opponent-card-${card.id}`
            : `#table-card-${card.id}`;

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

    timeline.to(cardsToMove.map(card => 
        document.querySelector(handStore.opponentHand.includes(card) 
            ? `#opponent-card-${card.id}`
            : `#table-card-${card.id}`
        )), {
        x: `+=${templateX}`,
        y: `+=${templateY}`,
        scale: 1,
        duration: 0.7,
        ease: "power2.inOut",
        onStart: () => {
            cardsToMove.forEach(card => {
                const selector = handStore.opponentHand.includes(card) 
                    ? `#opponent-card-${card.id}`
                    : `#table-card-${card.id}`;

                const cardElement = document.querySelector(selector);
                const inner = cardElement?.querySelector('.card-inner');
                if (inner) {
                    gsap.to(inner, { rotateY: 180, duration: 0.2, ease: "power1.inOut" });
                }
            });
        },
        onComplete: () => {
            cardsToMove.forEach(card => {
                const selector = handStore.opponentHand.includes(card) 
                    ? `#opponent-card-${card.id}`
                    : `#table-card-${card.id}`;

                const cardElement = document.querySelector(selector);
                if (cardElement) {
                    gsap.set(cardElement, { zIndex: 0 });
                }
            });
        }
    });
},

    findCombinations(arrA, arrB) {
        const maxSum = 13;
        let maxLength = 0;
        let bestCombination = null;
      
        for (let i = 1; i <= arrA.length; i++) {
          const combinationsA = computerStore.getCombinations(arrA, i);
          for (const combA of combinationsA) {
            for (let j = 1; j <= arrB.length; j++) {
              const combinationsB = computerStore.getCombinations(arrB, j);
              for (const combB of combinationsB) {
                const sumA = combA.reduce((acc, val) => acc + val, 0);
                const sumB = combB.reduce((acc, val) => acc + val, 0);
                if (sumA === sumB && sumA <= maxSum) {
                  const length = combA.length + combB.length;
                  if (length > maxLength) {
                    maxLength = length;
                    bestCombination = [combA, combB];
                  }
                }
              }
            }
          }
        }
      
        return bestCombination;
      },

        getCombinations(arr, k) {
        const result = [];
        function backtrack(start, current) {
          if (current.length === k) {
            result.push([...current]);
            return;
          }
          for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            backtrack(i + 1, current);
            current.pop();
          }
        }
        backtrack(0, []);
        return result;
      },

      computerMove() {
        if (gameStore.isGameOver) return;

        if (!computerStore.capturing && !computerStore.placingCard) { 
            const A = handStore.table.map(card => getCardValue(card));
            const B = handStore.opponentHand.map(card => getCardValue(card));
    
            const result = computerStore.findCombinations(A, B);
    
            if (result) {
                computerStore.capturing = true;
                computerStore.captureCards();
                gameStore.lastToCapture = 2;
            } else {
                computerStore.placingCard = true;
                computerStore.placeCard();
            }
        }

        // console.log(handStore.opponentTaken);
        // console.log(handStore.opponentHand);
        // console.log(handStore.table);
        //console.log(gameStore.lastToCapture);
    },
});
