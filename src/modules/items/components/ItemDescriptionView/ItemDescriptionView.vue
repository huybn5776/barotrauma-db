<template>
  <div v-if="item.description" class="items-description-view">
    <p class="items-description-text">{{ item.description }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ItemPrefab } from '@interfaces/Item-prefab';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ item: ItemPrefab }>();
</script>

<style lang="scss" scoped>
@import './ItemDescriptionView';
</style>
