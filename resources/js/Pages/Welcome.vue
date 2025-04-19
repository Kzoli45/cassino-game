<script setup>
import { Head, Link } from '@inertiajs/vue3';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import Modal from '@/Components/Modal.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';
import { ref } from 'vue';

defineProps({
    canLogin: {
        type: Boolean,
    },
    canRegister: {
        type: Boolean,
    },
    laravelVersion: {
        type: String,
        required: true,
    },
    phpVersion: {
        type: String,
        required: true,
    },
});

const showRules = ref(false);

const toggleRules = () => {
    showRules.value = !showRules.value;
};

</script>

<template>
    <Head title="Home" />
    <div class="bg-gray-50 text-black/50 dark:bg-slate-600 dark:text-white/50">
        
        <div
            class="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white"
        >
            <div class="relative w-full max-w-2xl px-6 lg:max-w-7xl items-center justify-center flex flex-col">
                <main class="mt-6 mb-6">
                    <div class="justify-center items-center">
                        <div class="dark:bg-slate-800 p-12 justify-center items-center flex flex-col gap-4 rounded-lg">
                            <Link href="/game/computer">
                            <PrimaryButton>
                                Play vs Computer
                            </PrimaryButton>
                            </Link>
                            <Link href="/room">
                                <PrimaryButton>
                                    Play vs Friend
                                </PrimaryButton>
                            </Link>
                            <!-- <PrimaryButton>
                                Game Tutorial
                            </PrimaryButton> -->
                            <PrimaryButton @click="toggleRules">
                                Game Rules
                            </PrimaryButton>

                            <Modal :show="showRules" @close="toggleRules">
                                <div class="p-4 bg-slate-800 rounded-lg shadow-lg">
                                    <h2 class="text-lg font-semibold text-white">How To Play Cassino</h2>
                                    <p class="mt-2 text-sm text-gray-300">
                                        Cassino is played with a standard 52-card deck, without jokers. In some variations the game be played by up to 4 players, but in this online version a maximum of 2 people go head to head. The aim of the game is to collect points, by capturing cards from the table.
                                    </p>
                                    <h3 class="font-semibold text-white mt-4">Card Values</h3>
                                    <p class="mt-2 text-sm text-gray-300">
                                        The color of the cards is irrelevant, except for 3 specific scenarios which will be mentioned in the section about adding up the cards.
                                        The number cards simply equal their value, while the face cards have the following values: <br></br> A = 1, J = 11, Q = 12, K = 13.
                                    </p>
                                    <h3 class="font-semibold text-white mt-4">The Dealing Phase</h3>
                                    <p class="mt-2 text-sm text-gray-300">
                                        After shuffling the deck, both players are dealt 3 cards each, and 4 cards are dealt to the table face up. The remaining deck is placed away from the table. After this, one of the players can begin their turn.
                                    </p>
                                    <h3 class="font-semibold text-white mt-4">The Capturing Phase</h3>
                                    <p class="mt-2 text-sm text-gray-300">
                                        Players can capture cards from the table by matching the value of the card they want to capture with a card from their hand. If the player has a card that matches the value of a card on the table, they can capture it by placing their card on top of the card they want to capture. The player can also capture multiple cards at once, if the sum of the cards on the table equals the value of the card in their hand, and this sum doesn't exceed 13. If the player captures all the cards on the table, they get a Cassino, which is worth 1 point. After this, since there are no cards on the table, the next player must first place a card on the table. If a player can't or doesn't want to capture any cards, they may place a card from their hand on the table, next to the other cards. This also calssifies as their turn. Then it'S the other players turn and the round goes on until both players have played all their cards. Whoever captured a card last, gets to start the next round. The game has 8 rounds, and the last round is played with both players having their cards face up. At the end of the game, if there are still cards on the table, whoever captured a card last gets to capture all the remaining cards.
                                    </p>
                                    <h3 class="font-semibold text-white mt-4">Scoring</h3>
                                    <p class="mt-2 text-sm text-gray-300">
                                        After the 8 rounds, each player counts their cards and recives points based on the following rules: <br></br> - 3 points for the player with the most cards <br></br> - 2 points for the player with the most spades <br></br> - 2 points for the player with the 10 of diamonds <br></br> - 1 point for the player with the 2 of spades <br></br> - 1 point for each Ace.
                                        <br></br>
                                        Whoever has more points at the end of the game wins. If both players have the same amount of points, the game is a draw.
                                    </p>
                                    <p class="mt-2 text-md font-semibold text-gray-300">To get familiar with the look of the game, check out the tutorial section in the menu.</p>
                                    <div class="flex justify-end mt-4">
                                        <SecondaryButton @click="toggleRules">
                                            Close
                                        </SecondaryButton>
                                    </div>
                                </div>
                            </Modal>

                            <div v-if="canLogin">
                                <div v-if="$page.props.auth.user" class="flex flex-col gap-4">
                                    <a href="/dashboard">
                                    <PrimaryButton>
                                        Account Settings
                                    </PrimaryButton>
                                </a>
                                <Link href="/logout" method='post'>
                                    <PrimaryButton>
                                        Log out
                                    </PrimaryButton>
                                </Link>
                                </div>
                                <div v-else class="flex flex-col gap-4">
                                    <a href="/login">
                                        <PrimaryButton>
                                            Log in
                                        </PrimaryButton>
                                    </a>
                                    <a v-if="canRegister" href="/register">
                                        <PrimaryButton>
                                            Register
                                        </PrimaryButton>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
</template>
