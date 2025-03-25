const suits = ['C', 'D', 'H', 'S'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const createDeck = () => {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({suit: suit, value: value, id: `${suit}${value}`});
        }
    }

    //console.log(deck);

    return deck;
}

export const shuffleDeck = () => {
    const deck = createDeck();
    for (let i = deck.length -1; i >0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1))
            const oldValue = deck[newIndex]
            deck[newIndex] = deck[i]
            deck[i] = oldValue
    }

    //console.log(deck)

    return deck;
}


export const getRandomCard = () => {
    const deck = createDeck();
    let randomIndex = Math.floor(Math.random() * deck.length);
    let card = deck[randomIndex];
    deck.splice(randomIndex, 1);

    //console.log(card);

    return card;
}

export const createCards = (hand) => {
    hand.forEach(card => {
        if (card.suit === 'C') {
            card.suit = '♣';
        }
        if (card.suit === 'D') {
            card.suit = '♦';
        }
        if (card.suit === 'H') {
            card.suit = '♥';
        }
        if (card.suit === 'S') {
            card.suit = '♠';
        }

        card.value = card.value
    });

    return hand;
}

export const getCardValue = (card) => {
    if (card.value === 'J') {
        return 11;
    }
    if (card.value === 'Q') {
        return 12;
    }
    if (card.value === 'K') {
        return 13;
    }
    if (card.value === 'A') {
        return 1;
    }

    return parseInt(card.value);
}

export const isCardRed = (card) => {
    return card.suit === '♦' || card.suit === '♥';
}
