<template>
  <div
    v-if="selectedColumns?.includes(column)"
    :style="{ order: (rowNumber + 1) * selectedColumns.length + columnsOrder?.indexOf(column) }"
    :class="{
      'highlight-item': highlightItem === viewData.item.identifier,
      'temporary-row': viewData.isTemporaryRow,
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { ItemViewData } from '@interfaces/item-view-data';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  column: string;
  selectedColumns: string[];
  columnsOrder: string[];
  rowNumber: number;
  highlightItem?: string | undefined;
  viewData: ItemViewData;
}>();
</script>

<style lang="scss" scoped>
@import './ItemListCell';
</style>
