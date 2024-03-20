<template>
    <section>
        <h3>Arrive?</h3>
        <button @click="replay(true)">Yes</button>
        <button @click="replay(false)">No</button>
    </section>
</template>

<script>
export default {
    methods: {
        replay(ans) {
            this.$emit(ans)
        }
    }
}
</script>