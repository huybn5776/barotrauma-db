<template>
  <div class="usage-item-container">
    <span>Item usage: {{ item?.item?.name }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ItemViewData } from '@interfaces/item-view-data';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ item: ItemViewData }>();
</script>

<style lang="scss" scoped>
@import './ItemUsageView';
</style>
