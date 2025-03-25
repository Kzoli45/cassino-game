<script setup>
    import PrimaryButton from '@/Components/PrimaryButton.vue';
    import TextInput from '@/Components/TextInput.vue';
    import { useForm } from '@inertiajs/vue3';

    const joinForm = useForm({
        room_code: '',
    });

    const createRoom = () => {
        joinForm.post(route('rooms.create'));
    }

    const joinRoom = () => {
        joinForm.post(route('rooms.join'));
    }
</script>

<template>
    <div class="relative w-full max-w-2xl px-6 lg:max-w-7xl items-center justify-center flex flex-col min-h-screen">
        <main class="mt-6 mb-6">
            <div class="justify-center items-center">
                <div class="dark:bg-slate-800 p-8 justify-center items-center flex flex-col gap-4 rounded-lg">
                    <div class="flex flex-col gap-4 w-full">
                        <div class="flex justify-start flex-col">
                            <p class="text-white mb-4 w-full">Enter the room code</p>
                            <form @submit.prevent="joinRoom" class="flex flex-row gap-4">
                                <TextInput v-model="joinForm.room_code" name="room_code" type="text" placeholder="Room Code" />
                                <PrimaryButton type="submit">
                                    Join Room
                                </PrimaryButton>
                            </form>
                        </div>
                        <div v-if="joinForm.errors.room_code" class="text-red-500">
                            {{ joinForm.errors.room_code }}
                        </div>
                    </div>
                    <h1 class="text-white">OR</h1>
                    <PrimaryButton @click="createRoom">
                        Create Room
                    </PrimaryButton>
                </div>
            </div>
        </main>
    </div>
</template>