<script setup>
    import Modal from '@/Components/Modal.vue';
    import PrimaryButton from '@/Components/PrimaryButton.vue';
    import { Link } from '@inertiajs/vue3';
    import { gameStore } from '@/shared/gameCycle';
    import { ref, onMounted, nextTick } from 'vue';

    const showResult = ref(false);

    onMounted(() => {
        nextTick(() => {
            showResult.value = true;
        });
    });

    const toggleResult = () => {
        showResult.value = !showResult.value;
    };
</script>

<template>
    <div class="bg-slate-600 flex flex-row items-center justify-center h-screen w-full my-4">
        <div class="bg-slate-800 flex flex-col items-center justify-center gap-4 m-4 rounded-lg p-12">
            <PrimaryButton @click="toggleResult">
                Result
            </PrimaryButton>
            <PrimaryButton @click="gameStore.newGame">
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
                    <h1 v-show="gameStore.result.winner === 1" class="text-2xl font-bold text-white">You won!</h1>
                    <h1 v-show="gameStore.result.winner === 2" class="text-2xl font-bold text-white">Opponent wins!</h1>
                    <h1 v-show="gameStore.result.winner === 0" class="text-2xl font-bold text-white">Rare Draw!</h1>

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
                                    <td class="px-6 py-4 text-right" :class="{ 'text-green-500': gameStore.result.playerCards > gameStore.result.opponentCards }">
                                        {{ gameStore.result.playerCards }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r" :class="{ 'text-green-500': gameStore.result.opponentCards > gameStore.result.playerCards }">
                                        {{ gameStore.result.opponentCards }}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <p v-show="gameStore.result.playerCards !== gameStore.result.opponentCards">3</p>
                                        <p v-show="gameStore.result.playerCards === gameStore.result.opponentCards">0</p>
                                    </td>
                                </tr>
                                <tr class="bg-white border-b dark:bg-slate-800 dark:border-gray-700 border-gray-200">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Spades
                                    </th>
                                    <td class="px-6 py-4 text-right" :class="{ 'text-green-500': gameStore.result.playerSpades > gameStore.result.opponentSpades }">
                                        {{ gameStore.result.playerSpades }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r" :class="{ 'text-green-500': gameStore.result.opponentSpades > gameStore.result.playerSpades }">
                                        {{ gameStore.result.opponentSpades }}
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
                                        {{ gameStore.result.playerAces }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r">
                                        {{ gameStore.result.opponentAces }}
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
                                        <p v-show="gameStore.result.tenOfDiamonds === 1" class="text-green-500">-</p>
                                    </td>
                                    <td class="px-6 py-4 text-center border-r">
                                        <p v-show="gameStore.result.tenOfDiamonds === 2" class="text-green-500">-</p>
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
                                        <p v-show="gameStore.result.twoOfSpades === 1" class="text-green-500">-</p>
                                    </td>
                                    <td class="px-6 py-4 text-center border-r">
                                        <p v-show="gameStore.result.twoOfSpades === 2" class="text-green-500">-</p>
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
                                        {{ gameStore.result.playerTables }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r border-b">
                                        {{ gameStore.result.opponentTables }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-b">
                                        1
                                    </td>
                                </tr>
                                <tr class="bg-white dark:bg-slate-800">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        Total
                                    </th>
                                    <td class="px-6 py-4 text-right" :class="{ 'text-green-500': gameStore.result.playerTotal > gameStore.result.opponentTotal }">
                                        {{ gameStore.result.playerTotal }}
                                    </td>
                                    <td class="px-6 py-4 text-center border-r" :class="{ 'text-green-500': gameStore.result.opponentTotal > gameStore.result.playerTotal }">
                                        {{ gameStore.result.opponentTotal }}
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