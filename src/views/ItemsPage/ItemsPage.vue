<template>
  <div class="items-container">
    <template v-for="item of availableItems" :key="item.identifier">
      <div class="item-image" :id="item.identifier">
        <ItemImage :item="item" />
      </div>

      <div class="item-name">
        <a
          class="item-name-link"
          target="_blank"
          :href="`https://barotraumagame.com/baro-wiki/index.php?search=${item.englishName || item.name}`"
        >
          <p>{{ item.name }}</p>
          <p v-if="item.englishName">{{ item.englishName }}</p>
        </a>
      </div>

      <div class="item-recipe">
        <FabricationRecipeView :item="item" :itemsMap="itemIdMap" :allItems="availableItems" />
      </div>

      <div class="item-recipe">
        <DeconstructRecipeView :item="item" :itemsMap="itemIdMap" :allItems="availableItems" />
      </div>

      <div>
        <ItemPriceView :item="item" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';

import { indexBy } from 'ramda';

import DeconstructRecipeView from '@components/DeconstructRecipeView/DeconstructRecipeView.vue';
import FabricationRecipeView from '@components/FabricationRecipeView/FabricationRecipeView.vue';
import ItemImage from '@components/ItemImage/ItemImage.vue';
import ItemPriceView from '@components/ItemPriceView/ItemPriceView.vue';
import { useProvideLocale } from '@compositions/use-provide-locale';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { mergeItemsName, mergeVariant } from '@services/game-data-parser';

const excludedNameIdentifiers = ['unidentifiedgeneticmaterial', 'geneticmaterial'];

const allItems = ref<ItemPrefab[]>([]);
const preferredLocale = useProvideLocale();

const itemIdMap = computed<Record<string, ItemPrefab>>(() => indexBy((item) => item.identifier, allItems.value));
const availableItems = computed<ItemPrefab[]>(() =>
  allItems.value
    .filter((item) => item.fabricationRecipes?.length || item.deconstructItems?.length || item.price)
    .filter(({ nameIdentifier }) => !(nameIdentifier && excludedNameIdentifiers.includes(nameIdentifier))),
);

onMounted(async () => {
  const originalItems: ItemPrefab[] = await (await fetch('/data-source/items/items.json')).json();
  const englishLocale: Locale = await (await fetch(`/data-source/texts/english.json`)).json();
  const targetLocale: Locale = await preferredLocale;
  const validItems = originalItems.filter((item) => item.category !== 'Legacy');
  const itemsWithLocale = mergeItemsName(validItems, targetLocale, englishLocale);
  allItems.value = mergeVariant(itemsWithLocale);
});
</script>

<style lang="scss" scoped>
@import './ItemsPage';
</style>
