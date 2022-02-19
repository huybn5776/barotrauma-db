<template>
  <div
    v-if="gainItem || usageItem"
    class="item-action-row"
    :style="{ order: selectedColumns.length, 'grid-column': gainViewGridColumn }"
  >
    <div v-if="selectedColumns.includes('image')" class="item-action-row-image">
      <ItemImage :item="gainItem?.item || usageItem?.item" :size="32" />
    </div>
    <ItemGainView v-if="gainItem" :item="gainItem" />
    <ItemUsageView v-if="usageItem" :item="usageItem" />
    <div class="item-action-row-button">
      <button class="b-button item-action-button" @click="emits('reset')">Reset</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import ItemImage from '@components/ItemImage/ItemImage.vue';
import { ItemViewData } from '@interfaces/item-view-data';
import ItemGainView from '@modules/items/components/ItemGainView/ItemGainView.vue';
import ItemUsageView from '@modules/items/components/ItemUsageView/ItemUsageView.vue';

const props = defineProps<{
  selectedColumns: string[];
  gainItem: ItemViewData | undefined;
  usageItem: ItemViewData | undefined;
}>();
const emits = defineEmits<{ (e: 'reset'): void }>();

const gainViewGridColumn = computed(() => `1 / ${props.selectedColumns.length + 1}`);
</script>

<style lang="scss" scoped>
@import './ItemActionInfoRow';
@import '/src/styles/common';
</style>
