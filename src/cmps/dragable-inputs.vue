<template>
    <div>
        <ul>
            <li v-for="(input, index) in inputs" :key="input.id" :draggable="true" @dragstart="dragStart(index)"
                @dragover.prevent="dragOver(index)" @drop="drop(index)" @dragend="dragEnd" class="drag-item">
                <span>{{ index + 1 }}</span>
                <input v-model="input.value" placeholder="Enter text..." />
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            inputs: [
                { id: 1, value: '' },
                { id: 2, value: '' },
                { id: 3, value: '' },
            ],
            draggingIndex: null,
        };
    },
    methods: {
        dragStart(index) {
            this.draggingIndex = index;
        },
        dragOver(index) {
            // Optional visual feedback logic for hovering over items can go here
        },
        drop(index) {
            if (this.draggingIndex !== null && this.draggingIndex !== index) {
                // Rearrange the items
                const draggedItem = this.inputs[this.draggingIndex];
                this.inputs.splice(this.draggingIndex, 1); // Remove the dragged item
                this.inputs.splice(index, 0, draggedItem); // Insert it at the new position
            }
        },
        dragEnd() {
            this.draggingIndex = null; // Reset the index after drag operation
        },
    },
};
</script>

<style>
ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.drag-item {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 5px;
    background-color: #f3f3f3;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
    transition: background-color 0.2s ease;
}

.drag-item:active {
    cursor: grabbing;
}

.drag-item:hover {
    background-color: #e0e0e0;
}
</style>