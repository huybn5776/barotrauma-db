<template>
  <div ref="dropTargetRef" class="file-drop-zone">
    <slot />
    <div ref="dropOverlayRef" class="drag-overlay" :style="{ visibility: fileDragEnter ? 'visible' : 'hidden' }"></div>
  </div>
</template>

<script lang="ts" setup>
import { useDropArea } from '@compositions/use-drop-area';

const emits = defineEmits<{ (e: 'fileDropped', value: Record<string, File>): void }>();

const { dropTargetRef, dropOverlayRef, fileDragEnter } = useDropArea({
  fileDropped: (filesMap) => emits('fileDropped', filesMap),
});
</script>

<style lang="scss" scoped>
@import './FileDropZone';
</style>
