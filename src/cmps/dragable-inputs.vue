<template>
    <div>
        <ul>
            <li v-for="(input, index) in inputs" :key="input.id" :draggable="true" @dragstart="dragStart(index)"
                @dragover.prevent="dragOver(index)" @drop="drop(index)" @dragend="dragEnd"
                @touchstart="touchStart(index, $event)" @touchmove="touchMove($event)" @touchend="touchEnd"
                class="drag-item">
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
            touchStartY: 0, // Stores the initial Y position of a touch
        };
    },
    methods: {
        dragStart(index) {
            this.draggingIndex = index;
        },
        dragOver(index) { },
        drop(index) {
            if (this.draggingIndex !== null && this.draggingIndex !== index) {
                const draggedItem = this.inputs[this.draggingIndex];
                this.inputs.splice(this.draggingIndex, 1);
                this.inputs.splice(index, 0, draggedItem);
            }
            this.draggingIndex = null;
        },
        dragEnd() {
            this.draggingIndex = null;
        },
        touchStart(index, event) {
            this.draggingIndex = index;
            this.touchStartY = event.touches[0].clientY; // Record the starting Y position
        },
        touchMove(event) {
            const currentY = event.touches[0].clientY;
            const hoveredIndex = Math.floor(
                (currentY - event.target.parentElement.offsetTop) / event.target.offsetHeight
            );

            if (hoveredIndex !== this.draggingIndex && hoveredIndex >= 0 && hoveredIndex < this.inputs.length) {
                this.drop(hoveredIndex); // Reorder on move
                this.draggingIndex = hoveredIndex; // Update dragging index
            }
        },
        touchEnd() {
            this.draggingIndex = null; // Reset dragging index
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

.drag-item:hover {
    background-color: #e0e0e0;
}

.drag-item:active {
    cursor: grabbing;
}
</style>