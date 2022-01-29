<template>
  <div class="items-container">
    <div class="items-grid-header" />
    <div class="items-grid-header">
      <SearchInput placeholder="Name" v-model="nameSearchTerm" />
    </div>
    <div class="items-grid-header">
      <SearchInput placeholder="Recipe" v-model="recipeSearchTerm" />
    </div>
    <div class="items-grid-header">
      <SearchInput placeholder="Deconstruct" v-model="deconstructSearchTerm" />
    </div>
    <div class="items-grid-header">
      <span class="item-header-text">Price</span>
    </div>

    <template v-for="{ item, fabricationRecipes, deconstructRecipe } of visibleItems" :key="item.identifier">
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
        <FabricationRecipeView :recipes="fabricationRecipes" />
      </div>

      <div class="item-recipe">
        <DeconstructRecipeView :recipe="deconstructRecipe" />
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
import SearchInput from '@components/SearchInput/SearchInput.vue';
import { useFilterItem, ItemFilterCondition } from '@compositions/use-filter-item';
import { SettingKey } from '@enums/setting-key';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';
import { Locale } from '@interfaces/locale';
import { DataConvertContext, convertFabricationRecipe, convertDeconstructRecipe } from '@services/data-convert-service';
import { mergeItemsName, mergeVariant } from '@services/game-data-parser';
import { getSettingFromStorage } from '@utils/storage-utils';

const excludedNameIdentifiers = ['unidentifiedgeneticmaterial', 'geneticmaterial'];

const nameSearchTerm = ref('');
const recipeSearchTerm = ref('');
const deconstructSearchTerm = ref('');

const itemFilter = computed<ItemFilterCondition>(() => ({
  name: nameSearchTerm.value,
  recipe: recipeSearchTerm.value,
  deconstruct: deconstructSearchTerm.value,
}));

const itemsViewData = ref<ItemViewData[]>([]);
const visibleItems = useFilterItem(itemsViewData, itemFilter);

onMounted(async () => {
  const originalItems: ItemPrefab[] = await (await fetch('/data-source/items/items.json')).json();
  const englishLocale: Locale = await (await fetch(`/data-source/texts/english.json`)).json();
  const preferredLocale = (await getSettingFromStorage(SettingKey.PreferredLocale)) || 'traditional-chinese';
  const targetLocale: Locale = await (await fetch(`/data-source/texts/${preferredLocale}.json`)).json();

  const validItems = originalItems.filter((item) => item.category !== 'Legacy');
  const itemsWithLocale = mergeItemsName(validItems, targetLocale, englishLocale);
  const allItems = mergeVariant(itemsWithLocale);

  const availableItems = allItems
    .filter((item) => item.fabricationRecipes?.length || item.deconstructItems?.length || item.price)
    .filter(({ nameIdentifier }) => !(nameIdentifier && excludedNameIdentifiers.includes(nameIdentifier)));

  const itemsMap = indexBy((item) => item.identifier, allItems);
  const context: DataConvertContext = { itemsMap, allItems, locale: targetLocale };
  itemsViewData.value = itemPrefabToViewData(availableItems, context);
});

function itemPrefabToViewData(items: ItemPrefab[], context: DataConvertContext): ItemViewData[] {
  return items.map((item) => {
    const fabricationRecipes = item.fabricationRecipes?.map((fabricationRecipe) =>
      convertFabricationRecipe(item, fabricationRecipe, context),
    ) || [];
    const deconstructRecipe = convertDeconstructRecipe(item, context);
    return { item, fabricationRecipes, deconstructRecipe };
  });
}
</script>

<style lang="scss" scoped>
@import './ItemsPage';
</style>
