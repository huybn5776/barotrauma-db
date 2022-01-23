<template>
  <div class="deconstruct-item">
    <div v-for="itemRecipe of recipe" :key="itemRecipe.item.identifier" class="item-recipe-item">
      <ItemImage :item="itemRecipe.item" :size="32" />
      <span>{{ itemRecipe.item.name + (itemRecipe.count === 1 ? '' : ` × ${itemRecipe.count}`) }}</span>
    </div>
    <div v-if="recipe.length && item.deconstructTime" class="item-recipe-item">
      <i class="time-sand-icon" />
      <span>{{ item.deconstructTime }} </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import ItemImage from '@components/ItemImage/ItemImage.vue';
import { ItemPrefab } from '@interfaces/Item-prefab';

const props = defineProps<{ item: ItemPrefab; itemsMap: Record<string, ItemPrefab>; allItems: ItemPrefab[] }>();

interface RecipeItem {
  count: number;
  item: ItemPrefab;
}

const recipe = computed<RecipeItem[]>(() => {
  const items = props.item.deconstructItems;
  if (!items) {
    return [];
  }
  const itemsCountMap: Record<string, number> = {};
  items.forEach((i) => {
    itemsCountMap[i.identifier] = (itemsCountMap[i.identifier] || 0) + (i.outCondition || 1);
  });
  let deconstructItems: RecipeItem[] = Object.entries(itemsCountMap).map(([identifier, count]) => ({
    count,
    item: props.itemsMap[identifier],
  }));
  deconstructItems = orderItemInFabricationRecipe(deconstructItems);
  return deconstructItems;
});

function orderItemInFabricationRecipe(deconstructItems: RecipeItem[]): RecipeItem[] {
  const recipeItems = props.item.fabricationRecipes?.[0]?.requiredItems;
  if (!recipeItems) {
    return deconstructItems;
  }
  let pickingItems = [...deconstructItems];
  const sortingItems: RecipeItem[] = [];
  recipeItems.forEach((recipeItem) => {
    const sameItem = pickingItems.find((pickingItem) => pickingItem.item.identifier === recipeItem.identifier);
    if (sameItem) {
      sortingItems.push(sameItem);
      pickingItems = pickingItems.filter((pickingItem) => pickingItem !== sameItem);
    }
  });
  return [...sortingItems, ...pickingItems];
}
</script>

<style lang="scss" scoped>
@import './DeconstructRecipeView';
@import '/src/styles/item-recipe';
</style>
