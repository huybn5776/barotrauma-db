<template>
  <div class="deconstruct-item" :class="{ 'empty-deconstruct-item': !recipe }">
    <a
      v-for="{ count, item, recipe } of recipe?.items"
      :key="item.identifier"
      class="item-recipe-item"
      :href="`#${item.identifier}`"
      @click="emits('itemClick', $event, item)"
    >
      <ItemImage :item="item" :size="32" />
      <span>{{ item.name }}</span>
      <span v-if="count !== 1">{{ ` × ${count}` }}</span>
      <span v-if="recipe?.[0]?.commonness">{{ ` ${recipe?.[0]?.commonness * 100}%` }}</span>
    </a>
    <div v-if="recipe?.items.length && recipe.time" class="recipe-required-time">
      <i class="time-sand-icon" />
      <span>{{ recipe.time }} </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ItemImage from '@components/ItemImage/ItemImage.vue';
import { DeconstructRecipeInfo } from '@interfaces/deconstruct-recipe-info';
import { ItemPrefab } from '@interfaces/Item-prefab';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ recipe: DeconstructRecipeInfo | undefined }>();
const emits = defineEmits<{ (e: 'itemClick', event: MouseEvent, item: ItemPrefab): void }>();
</script>

<style lang="scss" scoped>
@import './DeconstructRecipeView';
@import '/src/styles/item-recipe';
</style>
