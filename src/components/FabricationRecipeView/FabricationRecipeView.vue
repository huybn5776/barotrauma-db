<template>
  <div v-for="(recipe, index) of recipes" :key="index" class="fabrication-recipe">
    <div class="recipe-items">
      <p v-if="recipe.displayName" class="recipe-display-name">{{ recipe.displayName }}</p>
      <a
        v-for="item of recipe.items"
        :key="item.item.identifier"
        class="item-recipe-item"
        :href="`#${item.item.identifier}`"
      >
        <ItemImage :item="item.item" :size="32" />
        <div>
          <span>{{ item.item.name + (item.count === 1 ? '' : ` × ${item.count}`) }}</span>
          <span v-if="item.condition">&ensp;({{ item.condition }})</span>
        </div>
      </a>

      <div class="item-recipe-markers">
        <div class="item-recipe-item">
          <i class="time-sand-icon" />
          <span>{{ recipe.requiredTime }}</span>
        </div>
      </div>
    </div>

    <div v-if="(recipe.amount && recipe.amount > 1) || recipe.requiresRecipe" class="recipe-tags">
      <div v-if="recipe.amount && recipe.amount > 1" class="product-amount">
        <span class="product-amount-number">{{ recipe.amount }}</span>
      </div>
      <i v-if="recipe.requiresRecipe" class="book-open-variant-icon" title="Recipe required" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import ItemImage from '@components/ItemImage/ItemImage.vue';
import { injectLocale } from '@compositions/use-provide-locale';
import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { RequiredItem } from '@interfaces/required-item';

const props = defineProps<{ item: ItemPrefab; itemsMap: Record<string, ItemPrefab>; allItems: ItemPrefab[] }>();

const locale = injectLocale();

interface FabricationRecipeInfo extends FabricationRecipe {
  displayName?: string;
  items: { count: number; item: ItemPrefab; condition?: string }[];
}

const recipes = computed<FabricationRecipeInfo[]>(() => {
  return props.item.fabricationRecipes?.map((fabricationRecipe) => {
    const itemsCountMap: Record<string, { count: number; item: ItemPrefab; requiredItem: RequiredItem }> = {};
    fabricationRecipe.requiredItems.forEach((requiredItem) => {
      const item =
        props.itemsMap[requiredItem.identifier] || props.allItems.find((i) => i.tags?.includes(requiredItem.tag));
      const itemCount =
        itemsCountMap[item.identifier] ?? (itemsCountMap[item.identifier] = { count: 0, item, requiredItem });
      itemCount.count += 1;
    });
    const countedItems = Object.values(itemsCountMap).map(({ count, item, requiredItem }) => ({
      count,
      item,
      condition: getRequiredItemCondition(requiredItem),
    }));
    return { ...fabricationRecipe, displayName: getDisplayName(fabricationRecipe), items: countedItems };
  });
});

function getRequiredItemCondition(item: RequiredItem): string | undefined {
  const min = item.minCondition === undefined ? undefined : item.minCondition * 100;
  const max = item.maxCondition === undefined ? undefined : item.maxCondition * 100;
  if (min !== undefined && max !== undefined && min === max) {
    return `${min}%`;
  }
  if (min && max === undefined) {
    return `>=${min}%`;
  }
  if (!min && max !== undefined) {
    return `<=${max}%`;
  }
  if (min && max !== undefined) {
    return `${min}~${max}%`;
  }
  return undefined;
}

function getDisplayName(fabricationRecipe: FabricationRecipe): string | undefined {
  const name = fabricationRecipe.displayName;
  if (name) {
    return locale?.value.displayNames[name]?.replace('[itemname]', props.item.name || '');
  }
  return undefined;
}
</script>

<style lang="scss" scoped>
@import './FabricationRecipeView';
@import '/src/styles/item-recipe';
</style>
