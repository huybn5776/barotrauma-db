<template>
  <div v-for="(recipe, index) of recipes" :key="index" class="fabrication-recipe">
    <div class="recipe-items">
      <p v-if="recipe.displayName" class="recipe-display-name">{{ recipe.displayName }}</p>
      <a
        v-for="item of recipe.items"
        :key="item.item.identifier"
        class="item-recipe-item"
        :href="`#${item.item.identifier}`"
        @click="emits('itemClick', $event, item.item)"
      >
        <ItemImage :item="item.item" :size="32" />
        <div>
          <span>{{ item.item.name + (item.count === 1 ? '' : ` × ${item.count}`) }}</span>
          <span v-if="item.condition">&ensp;({{ item.condition }})</span>
        </div>
      </a>

      <div class="item-recipe-markers">
        <div class="recipe-required-time">
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
import ItemImage from '@components/ItemImage/ItemImage.vue';
import { FabricationRecipeInfo } from '@interfaces/fabrication-recipe-info';
import { ItemPrefab } from '@interfaces/Item-prefab';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ recipes: FabricationRecipeInfo[] }>();
const emits = defineEmits<{ (e: 'itemClick', event: MouseEvent, item: ItemPrefab): void }>();
</script>

<style lang="scss" scoped>
@import './FabricationRecipeView';
@import '/src/styles/item-recipe';
</style>
