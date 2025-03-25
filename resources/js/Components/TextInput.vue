<script setup>
import { onMounted, ref } from 'vue';

const model = defineModel({
    type: String,
    required: true,
});

const input = ref(null);

onMounted(() => {
    if (input.value.hasAttribute('autofocus')) {
        input.value.focus();
    }
});

defineExpose({ focus: () => input.value.focus() });
</script>

<template>
    <input
        class="rounded-md border-slate-600 shadow-sm focus:border-gray-200 focus:ring-gray-200 bg-slate-600 text-white"
        v-model="model"
        ref="input"
    />
</template>
