<script setup>
    import PlayerSide from './PlayerSide.vue';
    import Table from './Table.vue';
    import OpponentSide from './OpponentSide.vue';

</script>

<template>
    <div class="bg-slate-600 flex flex-row items-center justify-center h-screen w-full my-4">
        <div class="bg-slate-800 flex flex-col items-center justify-center gap-12 w-[90%] m-4 rounded-lg">
            <OpponentSide/>
            <Table/>
            <PlayerSide/>
        </div>
    </div>
</template>

