<script setup>
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div
        class="flex min-h-screen flex-col items-center bg-slate-600 pt-6 sm:justify-center sm:pt-0"
    >
        <div
            class="mt-6 w-full overflow-hidden bg-slate-800 px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg text-white"
        >
            <slot />
        </div>
    </div>
</template>
