<script setup>
import { defineProps, ref, computed, nextTick, watch, onMounted } from 'vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import {Link} from '@inertiajs/vue3';
import Card from '@/Components/Card.vue';
import HiddenCard from '@/Components/HiddenCard.vue';
import TakenCards from '@/Components/TakenCards.vue';
import { isCardRed } from '@/shared/deck';
import { playRoom } from '@/shared/playroom';
import { usePage } from '@inertiajs/vue3';
import Modal from '@/Components/Modal.vue';
import { messageOptions } from '@/shared/messages';
import axios from 'axios';

const props = defineProps({
    room: Object,
    player: Object,
    opponent: Object,
    deck: Array,
})

const result = ref({
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
    winner: 0,
})

const showResult = ref(true);
const boxOpen = ref(false);

const messages = messageOptions()
const message = ref('')

const toggleBox = () => {
    boxOpen.value = !boxOpen.value;
};

const toggleResult = () => {
    showResult.value = !showResult.value;
};

const sendMessage = (message) => {
    axios.post(`/api/send-message/${props.room.room_code}`, {
        message: message
    }).then(() => {
        boxOpen.value = false;
    });
};

const page = usePage();

const isPlayer1 = computed(() => props.player.id === props.room.player1_id);

const myHand = computed(() => (isPlayer1.value ? playerHand.value : opponentHand.value));
const opponentHandHidden = computed(() => (isPlayer1.value ? opponentHand.value : playerHand.value));

const myTaken = computed(() => (isPlayer1.value ? playerTakenCards.value : opponentTakenCards.value));
const opponentTaken = computed(() => (isPlayer1.value ? opponentTakenCards.value : playerTakenCards.value));

const myScore = computed(() => (isPlayer1.value ? {
    cards: result.value.playerCards,
    spades: result.value.playerSpades,
    aces: result.value.playerAces,
    tables: result.value.playerTables,
    total: result.value.playerTotal,
} : {
    cards: result.value.opponentCards,
    spades: result.value.opponentSpades,
    aces: result.value.opponentAces,
    tables: result.value.opponentTables,
    total: result.value.opponentTotal,
}));

const opponentScore = computed(() => (isPlayer1.value ? {
    cards: result.value.opponentCards,
    spades: result.value.opponentSpades,
    aces: result.value.opponentAces,
    tables: result.value.opponentTables,
    total: result.value.opponentTotal,
} : {
    cards: result.value.playerCards,
    spades: result.value.playerSpades,
    aces: result.value.playerAces,
    tables: result.value.playerTables,
    total: result.value.playerTotal,
}));

const cardDeck = ref(props.deck);
const playerHand = ref([]);
const opponentHand = ref([]);
const table = ref([]);
const playerTakenCards = ref([]);
const opponentTakenCards = ref([]);

const currentPlayer = ref(null);
const lastToCapture = ref(null);
const round = ref(0);
const gameOver = ref(0);

const playerSelected = ref([]);
const tableSelected = ref([]);

const startGame = async () => {
    await axios.post(`/api/deal-cards/${props.room.room_code}`, {
        isFirstRound: true
    });
};

window.Echo.channel('room.' + props.room.room_code)
    .listen('CardsDealt', async (e) => {
        //console.log(e);
        playerHand.value = [];
        opponentHand.value = [];
        table.value = [];

        await nextTick();

        playerHand.value = e.playerHand;
        opponentHand.value = e.opponentHand;
        table.value = e.table;
        cardDeck.value = e.deck;

        currentPlayer.value = e.currentPlayer;
        lastToCapture.value = e.lastToCapture;
        round.value = e.round;
        gameOver.value = e.gameOver;

        await playRoom.animateDealing(myHand.value, opponentHandHidden.value, table.value, round.value);
    })
    .listen('CardPlaced', async (e) => {
        //console.log(e);
        const authUserId = page.props.auth.user.id;

        await nextTick();

        await playRoom.placeCardAnimation(e.card, e.playerId === authUserId ? 'player-card' : 'opponent-card', table.value, e.playerId === authUserId? false : true, round.value);

        watch(() => playRoom.placing, (newValue) => {
            if (!newValue) {
                playerHand.value = e.playerHand;
                opponentHand.value = e.opponentHand;
                table.value = e.table;
                currentPlayer.value = e.currentPlayer;
                lastToCapture.value = e.lastToCapture;
                round.value = e.round;
                gameOver.value = e.gameOver;
                playerSelected.value = [];
                tableSelected.value = [];
            }
        }, { immediate: true, flush: 'post'
        })
    })
    .listen('CardsCaptured', async(e) => {
        //console.log(e);
        const authUserId = page.props.auth.user.id;

        await nextTick();

        await playRoom.captureCardsAnimation(e.playerCaptured, e.tableCaptured, e.playerId === authUserId ? 'player-card' : 'opponent-card', e.playerId === authUserId? false : true, round.value);

        watch(() => playRoom.capturing, (newValue) => {
            if (!newValue) {
                playerHand.value = e.playerHand;
                opponentHand.value = e.opponentHand;
                table.value = e.table;
                playerTakenCards.value = e.playerTaken == null ? playerTakenCards.value : e.playerTaken;
                opponentTakenCards.value = e.opponentTaken == null ? opponentTakenCards.value : e.opponentTaken;
                currentPlayer.value = e.currentPlayer;
                lastToCapture.value = e.lastToCapture;
                round.value = e.round;
                gameOver.value = e.gameOver;
                playerSelected.value = [];
                tableSelected.value = [];
            }
        }, { immediate: true, flush: 'post'
        })
    })
    .listen('GameOver', async (e) => {
        //console.log(e);
        const authUserId = page.props.auth.user.id;

        await nextTick();

        await playRoom.cleanUpTable(e.table, e.lastToCapture, authUserId)

        result.value.playerCards = e.playerCards;
        result.value.opponentCards = e.opponentCards;
        result.value.playerSpades = e.playerSpades;
        result.value.opponentSpades = e.opponentSpades;
        result.value.tenOfDiamonds = e.tenOfDiamondsPlayer > e.tenOfDiamondsOpponent ? props.room.player1_id : props.room.player2_id;
        result.value.twoOfSpades = e.twoOfSpadesPlayer > e.twoOfSpadesOpponent ? props.room.player1_id : props.room.player2_id;
        result.value.playerAces = e.playerAces;
        result.value.opponentAces = e.opponentAces;
        result.value.playerTables = e.playerTables;
        result.value.opponentTables = e.opponentTables;
        result.value.playerTotal = e.playerTotal;
        result.value.opponentTotal = e.opponentTotal;
        result.value.winner = e.winner;

        watch(() => playRoom.clearing, (newValue) => {
            if (!newValue) {
                gameOver.value = 1;
                //console.log(result.value)
            }
        }, { immediate: true, flush: 'post'
        })
    })
    .listen('MessageSent', (e) => {
        console.log(e);
        if (e.userId !== page.props.auth.user.id) {
            message.value = e.message;
            setTimeout(() => {
                message.value = '';
            }, 2000);
        }
    });

    const selectCard = (card) => {
        let cardElement = document.getElementById(`player-card-${card.id}`);
        if (!cardElement) {
            cardElement = document.getElementById(`table-card-${card.id}`);
        }

        if (cardElement) {
            playRoom.selectAnimation(cardElement, playerSelected, tableSelected, myHand.value, table.value , () => {
                //console.log(playerSelected.value, tableSelected.value);
            });
        }
    }
</script>


<template>
    <template v-if="gameOver === 1">
        <div class="bg-slate-600 flex flex-row items-center justify-center h-screen w-full my-4">
            <div class="bg-slate-800 flex flex-col items-center justify-center gap-4 m-4 rounded-lg p-12">
                <PrimaryButton @click="toggleResult">
                    Result
                </PrimaryButton>
                <PrimaryButton>
                    Play Again
                </PrimaryButton>
                <Link href="/">
                    <PrimaryButton>
                        Main Menu
                    </PrimaryButton>
                </Link>
            </div>

            <Modal :show="showResult" @close="toggleResult">
            <div class="p-4 bg-slate-800 rounded-lg shadow-lg">
                <div class="flex flex-col items-center justify-center gap-6">
                    <h1 v-if="result.winner == $page.props.auth.user.id" class="text-2xl font-bold text-white">You won!</h1>
                    <h1 v-else-if="result.winner == 0" class="text-2xl font-bold text-white">Rare Draw!</h1>
                    <h1 v-else class="text-2xl font-bold text-white">Opponent wins!</h1>

                    <div class="relative overflow-x-auto">
                        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-sm">
                            <thead class="text-xs text-white uppercase bg-gray-50 dark:bg-slate-600 dark:text-white">
                                <tr>
                                    <th scope="col" class="px-6 py-3">
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        You
                                    </th>
                                    <th scope="col" class="px-6 py-3 border-r">
                                        Opponent
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Point value
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="bg-white border-b dark:bg-slate-800 dark:border-gray-700 border-gray-200">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Cards
                                    </th>
                                    <td class="px-6 py-4 text-right" :class="{ 'text-green-500': myScore.cards > opponentScore.cards }">
                                        {{ myScore.cards }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r" :class="{ 'text-green-500': opponentScore.cards > myScore.cards }">
                                        {{ opponentScore.cards }}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <p v-show="myScore.cards !== opponentScore.cards">3</p>
                                        <p v-show="myScore.cards === opponentScore.cards">0</p>
                                    </td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-slate-800 dark:border-gray-700 border-gray-200">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Spades
                                    </th>
                                    <td class="px-6 py-4 text-right" :class="{ 'text-green-500': myScore.spades > opponentScore.spades }">
                                        {{ myScore.spades }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r" :class="{ 'text-green-500': opponentScore.spades > myScore.spades }">
                                        {{ opponentScore.spades }}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        2
                                    </td>
                                </tr>
                                <tr class="bg-white dark:bg-slate-800">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Aces
                                    </th>
                                    <td class="px-6 py-4 text-right">
                                        {{ myScore.aces }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r">
                                        {{ opponentScore.aces }}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        1
                                    </td>
                                </tr>
                                <tr class="bg-white dark:bg-slate-800">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        10 of Diamonds
                                    </th>
                                    <td class="px-6 py-4 text-right">
                                        <p v-show="result.tenOfDiamonds == $page.props.auth.user.id" class="text-green-500">-</p>
                                    </td>
                                    <td class="px-6 py-4 text-center border-r">
                                        <p v-show="result.tenOfDiamonds != $page.props.auth.user.id" class="text-green-500">-</p>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        2
                                    </td>
                                </tr>
                                <tr class="bg-white dark:bg-slate-800">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        2 of Spades
                                    </th>
                                    <td class="px-6 py-4 text-right">
                                        <p v-show="result.twoOfSpades == $page.props.auth.user.id" class="text-green-500">-</p>
                                    </td>
                                    <td class="px-6 py-4 text-center border-r">
                                        <p v-show="result.twoOfSpades != $page.props.auth.user.id" class="text-green-500">-</p>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        2
                                    </td>
                                </tr>
                                <tr class="bg-white dark:bg-slate-800">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white border-b">
                                        Tables
                                    </th>
                                    <td class="px-6 py-4 text-right border-b">
                                        {{ myScore.tables }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r border-b">
                                        {{ opponentScore.tables }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-b">
                                        1
                                    </td>
                                </tr>
                                <tr class="bg-white dark:bg-slate-800">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Total
                                    </th>
                                    <td class="px-6 py-4 text-right" :class="{ 'text-green-500': myScore.total > opponentScore.total }">
                                        {{ myScore.total }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r" :class="{ 'text-green-500': opponentScore.total > myScore.total }">
                                        {{ opponentScore.total }}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
    </template>
    <template v-else>
    <div class="bg-slate-600 flex flex-row items-center justify-center h-screen w-full my-4">
        <div class="bg-slate-800 flex flex-col items-center justify-center gap-12 w-[90%] m-4 rounded-lg">
            <div class="opponent-side flex flex-row items-center justify-center w-full">
                <div class="flex flex-row gap-4 items-center justify-between m-2 w-full">
                        <TakenCards class="opponent-pile">
                            <Card class="opacity-0 absolute" id="opponent-template-card"/>
                            <HiddenCard v-for="card in opponentTaken" :key="card.id" :card="card" :id="`taken-card-${card.id}`" class="absolute">
                            <template #back>
                                <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                            </template>
                        </HiddenCard>
                        </TakenCards>
                <div class="flex flex-row flex-wrap gap-4 items-center justify-center flex-grow opponent-hand">
                    <div v-show="opponentHandHidden.length === 0">
                        <HiddenCard class="opacity-0"/>
                    </div>
                        <template v-if="round < 8">
                            <HiddenCard v-for="card in opponentHandHidden" :key="card.id" :card="card" :id="`opponent-card-${card.id}`">
                                <template #back>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                                </template>
                            </HiddenCard>
                        </template>
                        <template v-else>
                            <Card v-for="card in opponentHandHidden" :key="card.id" :card="card" :id="`opponent-card-${card.id}`">
                                <template #front>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                                </template>
                            </Card>
                        </template>
                </div>
            </div>
            </div>
            <div class="table-area flex flex-row items-center justify-center w-full">
                <div class="flex flex-row gap-4 items-center justify-between m-2 w-full">
                    <div class="flex flex-col justify-center items-center gap-6">
                        <div class="gap-2 md:gap-4 flex flex-col items-center justify-center text-xs md:text-lg">
                            <h1 class="text-gray-400 mr-0">{{ $page.props.auth.user.id === props.room.player1.id ? props.room.player2.name : props.room.player1.name }}</h1>
                            <span class="text-white text-l">{{ message }}</span>
                        </div>
                        <div v-show="round > 0" class="flex flex-row gap-2 md:gap-4 items-center justify-center text-xs md:text-lg">
                            <h1 class="text-white ml-6 mr-0"> Round: {{ round }}</h1>
                            <div v-show="currentPlayer == $page.props.auth.user.id">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform:"><path d="m12 16 5-6H7z"></path><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>
                            </div>
                            <div v-show="currentPlayer != $page.props.auth.user.id">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform:"><path d="M7 14h10l-5-6z"></path><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>
                            </div>
                        </div>
                        <div class="flex flex-row gap-2 md:gap-4 items-center justify-center text-xs md:text-lg">
                            <h1 class="text-white ml-6 mr-0">{{ $page.props.auth.user.name }}</h1>
                            <div class="flex flex-col items-center justify-center">
                                <svg class="cursor-pointer" @click="toggleBox" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);"><path d="M20 2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h3v3.766L13.277 18H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14h-7.277L9 18.234V16H4V4h16v12z"></path><circle cx="15" cy="10" r="2"></circle><circle cx="9" cy="10" r="2"></circle></svg>
                                <div v-show="boxOpen" class="bg-slate-600 rounded-md flex flex-row items-center justify-center gap-1 flex-grow z-10 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-8 max-w-[50%] text-md">	
                                    <div class="flex flex-col items-center justify-center gap-4">
                                        <div class="flex flex-row items-center justify-center gap-1 flex-grow flex-wrap">
                                            <div class="bg-white p-2 rounded-md cursor-pointer" @click="sendMessage(message.message)" v-for="message in messages" :key="message.id">
                                                {{ message.message }}
                                            </div>
                                        </div>
                                        <PrimaryButton class="mb-2" @click="toggleBox"> 
                                            Cancel
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                        <div class="flex flex-row flex-wrap gap-4 items-center justify-center flex-grow table-hand">
                            <div v-show="table.length === 0">
                                <Card class="placeholder opacity-0"/>
                            </div>
                            <Card v-for="card in table" :key="card.id" :card="card" :id="`table-card-${card.id}`" class="cursor-pointer" @click="selectCard(card)">
                                <template #front>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                                </template>
                            </Card>
                        </div>
                    <div class="flex flex-row items-center justify-end ml-12 mr-8 md:mx-8" id="deck">
                        <template v-if="cardDeck.length === 0">
                            <HiddenCard class="opacity-0 absolute" id="deck-card"/>
                        </template>
                        <template v-else>
                            <HiddenCard v-for="(card, index) in cardDeck" :key="index" :card="card" class="absolute">
                                <template #back>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                                </template>
                            </HiddenCard>
                        </template>
                    </div>
                </div>
            </div>

            <div class="player-side flex flex-row items-center justify-center w-full">
                <div class="flex flex-col items-center justify-center gap-4 w-full">
                    <div v-show="playRoom.wasIllegalMove">
                        <p class="text-red-600 transition">Illegal move!</p>
                    </div>
                    <div v-if="cardDeck.length === 52 && $page.props.auth.user.id === room.player1_id">
                        <PrimaryButton class="mb-6" @click="startGame">
                            Start Game
                        </PrimaryButton>
                    </div>
                    <div v-else-if ="cardDeck.length === 52 && $page.props.auth.user.id === room.player2_id">
                        <h1 class="text-white">Waiting for room owner to start the game..</h1>
                    </div>
                    <div v-else-if="playRoom.isLogicalMove(playerSelected, tableSelected) && currentPlayer == $page.props.auth.user.id">
                        <PrimaryButton class="mb-6" @click="playRoom.playerMove(playerSelected, tableSelected, props.room.room_code)">
                            Play Card
                        </PrimaryButton>
                    </div>  
                    <div v-else>
                        <PrimaryButton class="mb-6 opacity-0" disabled>
                            Placeholder
                        </PrimaryButton>
                    </div>
                    <div class="flex flex-row gap-4 items-center justify-center m-2 w-full">
                        <TakenCards class="player-pile">
                            <Card class="opacity-0 absolute" id="template-card"/>
                            <HiddenCard v-for="card in myTaken" :key="card.id" :card="card" :id="`taken-card-${card.id}`" class="absolute">
                                <template #back>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                    <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                                </template>
                            </HiddenCard>
                        </TakenCards>
                        <div class="flex flex-row flex-wrap gap-4 items-center justify-center flex-grow player-hand">
                            <div v-show="myHand.length === 0">
                                <Card class="opacity-0"/>
                            </div>
                            <Card v-for="card in myHand" :key="card.id" :card="card" :id="`player-card-${card.id}`" class="cursor-pointer" @click="selectCard(card)">
                            <template #front>
                                <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                            </template>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </template>
</template>
