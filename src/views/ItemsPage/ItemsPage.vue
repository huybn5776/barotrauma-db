<template>
  <div class="items-container">
    <div class="items-grid-header empty-header" />
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
    <div class="items-grid-header empty-header" />

    <template v-if="gainItem">
      <div class="gain-item-image">
        <ItemImage :item="gainItem?.item" :size="32" />
      </div>
      <ItemGainView v-if="gainItem" :item="gainItem" />
      <div class="item-actions">
        <button class="b-button item-action-button" @click="resetFilter">Reset</button>
      </div>
    </template>
    <template v-if="usageItem">
      <div class="gain-item-image">
        <ItemImage :item="usageItem?.item" :size="32" />
      </div>
      <ItemUsageView v-if="usageItem" :item="usageItem" />
      <div class="item-actions">
        <button class="b-button item-action-button" @click="resetFilter">Reset</button>
      </div>
    </template>

    <template v-for="viewData of visibleItems" :key="viewData.item.identifier">
      <div
        class="item-image"
        :id="viewData.item.identifier"
        :class="{ 'highlight-item': highlightItem === viewData.item.identifier }"
      >
        <ItemImage :item="viewData.item" :size="64" />
      </div>

      <div class="item-name" :class="{ 'highlight-item': highlightItem === viewData.item.identifier }">
        <a
          v-if="!showCollectibleImage || !viewData.collectibleItemImages?.length"
          class="item-name-link"
          target="_blank"
          :href="`https://barotraumagame.com/baro-wiki/index.php?search=${
            viewData.item.englishName || viewData.item.name
          }`"
        >
          <p>{{ viewData.item.name }}</p>
          <p v-if="viewData.item.englishName">{{ viewData.item.englishName }}</p>
        </a>
        <CollectibleItemImage
          v-if="viewData.collectibleItemImages?.length"
          :item="viewData"
          :showCollectibleImage="showCollectibleImage"
          @toggleView="showCollectibleImage = !showCollectibleImage"
        />
      </div>

      <div class="item-recipe" :class="{ 'highlight-item': highlightItem === viewData.item.identifier }">
        <FabricationRecipeView
          :recipes="viewData.fabricationRecipes"
          @itemClick="(event, item) => onNavigateToItem(event, item)"
        />
      </div>

      <div class="item-recipe" :class="{ 'highlight-item': highlightItem === viewData.item.identifier }">
        <DeconstructRecipeView
          :recipe="viewData.deconstructRecipe"
          @itemClick="(event, item) => onNavigateToItem(event, item)"
        />
      </div>

      <div :class="{ 'highlight-item': highlightItem === viewData.item.identifier }">
        <ItemPriceView :item="viewData.item" />
      </div>

      <div class="item-actions" :class="{ 'highlight-item': highlightItem === viewData.item.identifier }">
        <button
          v-if="viewData.hasGain"
          class="b-button item-action-button deconstruct-button"
          @click="findItemGain(viewData)"
        >
          Gain
        </button>
        <button
          v-if="viewData.hasUsage"
          class="b-button item-action-button recipe-button"
          @click="findItemUsage(viewData)"
        >
          Usage
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';

import { indexBy } from 'ramda';

import CollectibleItemImage from '@components/CollectibleItemImage/CollectibleItemImage.vue';
import DeconstructRecipeView from '@components/DeconstructRecipeView/DeconstructRecipeView.vue';
import FabricationRecipeView from '@components/FabricationRecipeView/FabricationRecipeView.vue';
import ItemGainView from '@components/ItemGainView/ItemGainView.vue';
import ItemImage from '@components/ItemImage/ItemImage.vue';
import ItemPriceView from '@components/ItemPriceView/ItemPriceView.vue';
import ItemUsageView from '@components/ItemUsageView/ItemUsageView.vue';
import SearchInput from '@components/SearchInput/SearchInput.vue';
import { useFilterItem, ItemFilterCondition } from '@compositions/use-filter-item';
import { SettingKey } from '@enums/setting-key';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';
import { Locale } from '@interfaces/locale';
import {
  DataConvertContext,
  convertFabricationRecipe,
  convertDeconstructRecipe,
  convertSoldIn,
  checkGainAndUsage,
  convertCollectibleItemImages,
} from '@services/data-convert-service';
import { mergeItemsName, mergeVariant } from '@services/game-data-parser';
import { getSettingFromStorage } from '@utils/storage-utils';

const excludedNameIdentifiers = ['unidentifiedgeneticmaterial', 'geneticmaterial'];

const nameSearchTerm = ref('');
const recipeSearchTerm = ref('');
const deconstructSearchTerm = ref('');

const gainItem = ref<ItemViewData>();
const usageItem = ref<ItemViewData>();
const highlightItem = ref<string>();

const showCollectibleImage = ref(false);

const itemFilter = computed<ItemFilterCondition>(() => ({
  name: nameSearchTerm.value,
  recipe: recipeSearchTerm.value,
  deconstruct: deconstructSearchTerm.value,
  gainItemId: gainItem.value?.item.identifier,
  usageItemId: usageItem.value?.item.identifier,
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
  return items
    .map((item) => {
      const fabricationRecipes =
        item.fabricationRecipes?.map((fabricationRecipe) =>
          convertFabricationRecipe(item, fabricationRecipe, context),
        ) || [];
      const deconstructRecipe = convertDeconstructRecipe(item, context);
      const soldPrices = convertSoldIn(item);
      const collectibleItemImages = convertCollectibleItemImages(item);

      return {
        item,
        fabricationRecipes,
        deconstructRecipe,
        soldPrices,
        collectibleItemImages,
      } as ItemViewData;
    })
    .map((viewData) => ({ ...viewData, ...checkGainAndUsage(viewData, context) }));
}

function resetFilter(): void {
  nameSearchTerm.value = '';
  recipeSearchTerm.value = '';
  deconstructSearchTerm.value = '';
  usageItem.value = undefined;
  gainItem.value = undefined;
}

function findItemGain(item: ItemViewData): void {
  resetFilter();
  gainItem.value = item;
  document.getElementsByClassName('app')[0].scrollTop = 0;
}

function findItemUsage(item: ItemViewData): void {
  resetFilter();
  usageItem.value = item;
  document.getElementsByClassName('app')[0].scrollTop = 0;
}

function onNavigateToItem(event: MouseEvent, item: ItemPrefab): void {
  const isTargetItemVisibleOnPage = visibleItems.value.find((i) => i.item.identifier === item.identifier);
  if (isTargetItemVisibleOnPage) {
    highLightOneItem(item.identifier);
  }
}

function highLightOneItem(identifier: string): void {
  highlightItem.value = identifier;
  setTimeout(() => {
    if (highlightItem.value === identifier) {
      highlightItem.value = undefined;
    }
  }, 1000);
}
</script>

<style lang="scss" scoped>
@import './ItemsPage';
@import '/src/styles/common';
</style>
