<template>
    <div>
        <ul>
            <li v-for="(input, index) in inputs" :key="input.id" :draggable="true"
                :class="{ dragging: draggingIndex === index }" @dragstart="dragStart(index)" @dragover.prevent
                @drop="swap(index)" @dragend="dragEnd" @touchstart="touchStart(index, $event)"
                @touchmove="touchMove($event)" @touchend="touchEnd" class="drag-item">
                <!-- <span>{{ index + 1 }}</span> -->
                <!-- <input v-model="input.value" placeholder="Enter text..." /> -->
                <p>{{ input.value }}</p>
            </li>
        </ul>
        <!-- Placeholder for the visual feedback on mobile -->
        <div v-if="isMobileDragging" :style="{ top: touchY + 'px', left: touchX + 'px' }" class="drag-ghost">
            <span>{{ draggingIndex !== null ? draggingIndex + 1 : '' }} - {{ inputs[draggingIndex].value }}</span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            inputs: [
                { id: 1, value: 'hi' },
                { id: 2, value: '' },
            ],
            draggingIndex: null, // Index of the item being dragged
            touchTargetIndex: null, // Index of the item currently being hovered over during touch
            touchX: 0, // X coordinate of the touch point
            touchY: 0, // Y coordinate of the touch point
            isMobileDragging: false, // Flag to show the dragged item visually on mobile
        };
    },
    methods: {
        dragStart(index) {
            this.draggingIndex = index;
            console.log(this.inputs[this.draggingIndex]);
            
        },
        swap(targetIndex) {
            if (this.draggingIndex !== null && this.draggingIndex !== targetIndex) {
                // Swap the dragged item with the target item
                [this.inputs[this.draggingIndex], this.inputs[targetIndex]] = [
                    this.inputs[targetIndex],
                    this.inputs[this.draggingIndex],
                ];
            }
        },
        dragEnd() {
            this.draggingIndex = null;
        },
        touchStart(index, event) {
            this.draggingIndex = index;
            this.isMobileDragging = true;
            this.touchX = event.touches[0].clientX;
            this.touchY = event.touches[0].clientY;
        },
        touchMove(event) {
            this.touchX = event.touches[0].clientX; // Update the position of the touch
            this.touchY = event.touches[0].clientY;

            // Use elementFromPoint to determine the hovered item
            const touchedElement = document.elementFromPoint(
                this.touchX,
                this.touchY
            );

            if (touchedElement) {
                const hoveredLi = touchedElement.closest('li'); // Find the closest li
                if (hoveredLi) {
                    const hoveredIndex = Array.from(hoveredLi.parentNode.children).indexOf(
                        hoveredLi
                    );

                    if (
                        hoveredIndex >= 0 &&
                        hoveredIndex < this.inputs.length &&
                        hoveredIndex !== this.draggingIndex
                    ) {
                        this.touchTargetIndex = hoveredIndex;
                    }
                }
            }
        },
        touchEnd() {
            if (this.draggingIndex !== null && this.touchTargetIndex !== null) {
                this.swap(this.touchTargetIndex);
            }
            this.draggingIndex = null;
            this.touchTargetIndex = null;
            this.isMobileDragging = false; // Hide the visual feedback
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

.dragging {
    opacity: 0.5;
    /* Make the dragged item semi-transparent */
}

.drag-ghost {
    position: absolute;
    pointer-events: none;
    /* Ensure the ghost does not block interactions */
    background-color: rgba(200, 200, 200, 0.8);
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>