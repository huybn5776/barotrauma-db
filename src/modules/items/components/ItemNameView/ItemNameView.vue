<template>
  <component
    class="item-name-view"
    :is="isModItem ? 'div' : 'a'"
    :target="isModItem ? undefined : '_blank'"
    :href="
      isModItem ? undefined : `https://barotraumagame.com/baro-wiki/index.php?search=${item.englishName || item.name}`
    "
  >
    <p>{{ item.name }}</p>
    <p v-if="item.englishName">{{ item.englishName }}</p>
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { ItemPrefab } from '@interfaces/Item-prefab';

const props = defineProps<{ item: ItemPrefab }>();
const isModItem = computed(() => !!props.item.modName);
</script>

<style lang="scss" scoped>
@import './ItemNameView';
</style>
