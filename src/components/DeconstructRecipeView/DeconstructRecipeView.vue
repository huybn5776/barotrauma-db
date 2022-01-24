<template>
  <div class="deconstruct-item">
    <a
      v-for="{ count, item } of recipe?.items"
      :key="item.identifier"
      class="item-recipe-item"
      :href="`#${item.identifier}`"
    >
      <ItemImage :item="item" :size="32" />
      <span>{{ item.name + (count === 1 ? '' : ` × ${count}`) }}</span>
    </a>
    <div v-if="recipe?.items.length && recipe.time" class="item-recipe-item">
      <i class="time-sand-icon" />
      <span>{{ recipe.time }} </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ItemImage from '@components/ItemImage/ItemImage.vue';
import { DeconstructRecipeInfo } from '@interfaces/deconstruct-recipe-info';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ recipe: DeconstructRecipeInfo }>();
</script>

<style lang="scss" scoped>
@import './DeconstructRecipeView';
@import '/src/styles/item-recipe';
</style>
