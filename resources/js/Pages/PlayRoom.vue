<script setup>
import { defineProps, ref, computed, nextTick, watch } from 'vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { router } from '@inertiajs/vue3';
import Card from '@/Components/Card.vue';
import HiddenCard from '@/Components/HiddenCard.vue';
import TakenCards from '@/Components/TakenCards.vue';
import { isCardRed } from '@/shared/deck';
import { playRoom } from '@/shared/playroom';
import { usePage } from '@inertiajs/vue3';

const props = defineProps({
    room: Object,
    player: Object,
    opponent: Object,
    deck: Array,
})

const page = usePage();

const isPlayer1 = computed(() => props.player.id === props.room.player1_id);

const myHand = computed(() => (isPlayer1.value ? playerHand.value : opponentHand.value));
const opponentHandHidden = computed(() => (isPlayer1.value ? opponentHand.value : playerHand.value));

const myTaken = computed(() => (isPlayer1.value ? playerTakenCards.value : opponentTakenCards.value));
const opponentTaken = computed(() => (isPlayer1.value ? opponentTakenCards.value : playerTakenCards.value));

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
        console.log(e);
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

        playRoom.animateDealing(myHand.value, opponentHandHidden.value, table.value, round.value);
    })
    .listen('CardPlaced', async (e) => {
        console.log(e);
        const authUserId = page.props.auth.user.id;

        await nextTick();

        await playRoom.placeCardAnimation(e.card, e.playerId === authUserId ? 'player-card' : 'opponent-card', table.value, e.playerId === authUserId? false : true);

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
        console.log(e);
        const authUserId = page.props.auth.user.id;

        await nextTick();

        await playRoom.captureCardsAnimation(e.playerCaptured, e.tableCaptured, e.playerId === authUserId ? 'player-card' : 'opponent-card', e.playerId === authUserId? false : true);

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
    .listen('GameOver', (e) => {
        console.log(e);
        gameOver.value = 1;
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
            <div class="bg-slate-800 flex flex-col items-center justify-center gap-12 w-[90%] m-4 rounded-lg">
                <h1>GameOver</h1>
            </div>
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
                        <HiddenCard v-for="card in opponentHandHidden" :key="card.id" :card="card" :id="`opponent-card-${card.id}`">
                            <template #back>
                                <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                            </template>
                        </HiddenCard>
                </div>
            </div>
            </div>
            <div class="table-area flex flex-row items-center justify-center w-full">
                <div class="flex flex-row gap-4 items-center justify-between m-2 w-full">
                    <div v-show="round > 0" class="flex flex-row gap-2 md:gap-4 items-center justify-center text-xs md:text-lg">
                        <h1 class="text-white ml-6 mr-0"> Round: {{ round }}</h1>
                        <div v-show="currentPlayer == $page.props.auth.user.id">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform:"><path d="m12 16 5-6H7z"></path><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>
                        </div>
                        <div v-show="currentPlayer != $page.props.auth.user.id">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform:"><path d="M7 14h10l-5-6z"></path><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>
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
                        <HiddenCard v-for="(card, index) in cardDeck" :key="index" :card="card" class="absolute">
                            <template #back>
                                <span :class="{'text-red-600': isCardRed(card)}">{{ card.suit }}</span>
                                <span :class="{'text-red-600': isCardRed(card)}">{{ card.value }}</span>
                            </template>
                        </HiddenCard>
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
                    <div class="flex flex-row gap-4 items-center justify-between m-2 w-full">
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
                    <div class="flex flex-row items-center justify-center ">
                </div>
            </div>
                </div>
            </div>
        </div>
    </div>
    </template>
</template>
