<template>
  <div class="item-price-view">
    <p v-if="price">${{ price }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { ItemPrefab } from '@interfaces/Item-prefab';

const props = defineProps<{ item: ItemPrefab }>();
const price = computed(() => props.item.price?.basePrice);
</script>

<style lang="scss" scoped>
@import './ItemPriceView';
</style>
