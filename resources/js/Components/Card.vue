<script setup>
</script>

<template>
    <div class="flex justify-center items-center">
        <div class="bg-transparent lg:w-20 lg:h-32 md:w-16 md:h-24 card w-12 h-20">
            <div class="relative w-full h-full text-center rounded-lg border-white border-2 card-inner">
                <div class="absolute w-full h-full card-front rounded-sm bg-white flex flex-row items-center justify-center gap-1 text-2xl">
                    <slot name="front">
                    </slot>
                </div>
                <div class="absolute w-full h-full card-back rounded-lg bg-red-700">
                    <slot name="back">
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .card {
        perspective: 1000px;
    }

    .card-inner {
        transform-style: preserve-3d;
        transition: transform 0.8s;
    }

    /* .card:hover .card-inner {
        transform: rotateY(180deg);
    } */

    .card-front, .card-back {
        backface-visibility: hidden;
    }

    .card-back {
        transform: rotateY(180deg);
    }

</style>

