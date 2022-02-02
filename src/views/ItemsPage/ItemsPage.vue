<template>
  <div class="items-page">
    <div class="items-top-bar">
      <ItemTagsBar :viewDataArray="itemsViewData" v-model:selected="selectedTags" />
      <ItemQuickFilter v-model="quickFilter" />
    </div>

    <div class="items-container">
      <div class="items-grid-header empty-header" />
      <div class="items-grid-header">
        <SearchInput class="item-column-filter-input" placeholder="Name" v-model="nameSearchTerm" />
      </div>
      <div class="items-grid-header">
        <SearchInput class="item-column-filter-input" placeholder="Recipe" v-model="recipeSearchTerm" />
      </div>
      <div class="items-grid-header">
        <SearchInput class="item-column-filter-input" placeholder="Deconstruct" v-model="deconstructSearchTerm" />
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

      <template v-for="viewData of itemsToShow" :key="viewData.item.identifier">
        <div
          class="item-cell item-image"
          :class="{
            'highlight-item': highlightItem === viewData.item.identifier,
            'temporary-row': viewData.isTemporaryRow,
          }"
        >
          <ItemImage :item="viewData.item" :size="64" />
        </div>

        <div
          class="item-cell item-name"
          v-item-intersection="{ enter: () => onItemRowEnter(viewData) }"
          :id="viewData.item.identifier"
          :class="{
            'highlight-item': highlightItem === viewData.item.identifier,
            'temporary-row': viewData.isTemporaryRow,
          }"
        >
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

        <div
          class="item-cell item-recipe"
          :class="{
            'highlight-item': highlightItem === viewData.item.identifier,
            'temporary-row': viewData.isTemporaryRow,
          }"
        >
          <FabricationRecipeView
            :recipes="viewData.fabricationRecipes"
            @itemClick="(event, item) => onNavigateToItem(event, item, viewData)"
          />
        </div>

        <div
          class="item-cell item-recipe"
          :class="{
            'highlight-item': highlightItem === viewData.item.identifier,
            'temporary-row': viewData.isTemporaryRow,
          }"
        >
          <DeconstructRecipeView
            :recipe="viewData.deconstructRecipe"
            @itemClick="(event, item) => onNavigateToItem(event, item, viewData)"
          />
        </div>

        <div
          class="item-cell"
          :class="{
            'highlight-item': highlightItem === viewData.item.identifier,
            'temporary-row': viewData.isTemporaryRow,
          }"
        >
          <ItemPriceView :item="viewData.item" />
        </div>

        <div
          class="item-cell item-actions"
          :class="{
            'highlight-item': highlightItem === viewData.item.identifier,
            'temporary-row': viewData.isTemporaryRow,
          }"
        >
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

      <p
        class="items-lazy-render-padding"
        :style="{ height: `${fillUpHeight}px` }"
        v-padding-intersection="{ enter: () => onLazyRenderPaddingVisible() }"
      >
        ⇊ View all ⇊
      </p>
    </div>
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
import ItemQuickFilter from '@components/ItemQuickFilter/ItemQuickFilter.vue';
import ItemTagsBar from '@components/ItemTagsBar/ItemTagsBar.vue';
import ItemUsageView from '@components/ItemUsageView/ItemUsageView.vue';
import SearchInput from '@components/SearchInput/SearchInput.vue';
import { useFilterItem, ItemFilterCondition } from '@compositions/use-filter-item';
import { useHighlightItem } from '@compositions/use-highlight-item';
import { useLazyRender } from '@compositions/use-lazy-render';
import { useMitt } from '@compositions/use-mitt';
import { useTemporaryItem } from '@compositions/use-temporary-item';
import { intersectionDirectiveFactory } from '@directives/IntersectionDirective';
import { SettingKey } from '@enums/setting-key';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';
import { DataConvertContext, itemsToViewData } from '@services/data-convert-service';
import { getAllItemsAndLocale, filterAvailableItems } from '@services/data-source-service';
import { getSettingFromStorage } from '@utils/storage-utils';

const { onEvent } = useMitt();

const vItemIntersection = intersectionDirectiveFactory({ threshold: 0.1 });
const vPaddingIntersection = intersectionDirectiveFactory({ threshold: 0 });

const quickFilter = ref('');
const nameSearchTerm = ref('');
const recipeSearchTerm = ref('');
const deconstructSearchTerm = ref('');
const selectedTags = ref<string[]>([]);

const gainItem = ref<ItemViewData>();
const usageItem = ref<ItemViewData>();
const { highlightItem, highLightOneItem } = useHighlightItem('highlight-item');

const showCollectibleImage = ref(false);

const itemFilter = computed<ItemFilterCondition>(() => ({
  quickFilter: quickFilter.value,
  name: nameSearchTerm.value,
  recipe: recipeSearchTerm.value,
  deconstruct: deconstructSearchTerm.value,
  tags: selectedTags.value,
  gainItemId: gainItem.value?.item.identifier,
  usageItemId: usageItem.value?.item.identifier,
}));

const itemsViewData = ref<ItemViewData[]>([]);
const visibleItems = useFilterItem(itemsViewData, itemFilter);
const {
  visibleItemsWithInsert: itemsWithTemporaryItems,
  setTemporaryItem,
  clearTemporaryItems,
} = useTemporaryItem(visibleItems, itemsViewData);
const { lazyRenderItems, fillUpHeight, onItemRowEnter, onLazyRenderPaddingVisible, renderAll } = useLazyRender(
  visibleItems,
  itemsWithTemporaryItems,
);
const itemsToShow = lazyRenderItems;

async function getItemsViewData(): Promise<ItemViewData[]> {
  const preferredLocale = (await getSettingFromStorage(SettingKey.PreferredLocale)) || 'english';
  const { items, locale } = await getAllItemsAndLocale(preferredLocale);
  const availableItems = filterAvailableItems(items);
  const itemsMap = indexBy((item) => item.identifier, items);
  const context: DataConvertContext = { itemsMap, items, locale };
  return itemsToViewData(availableItems, context);
}

onMounted(async () => {
  itemsViewData.value = await getItemsViewData();
  onEvent('locale-updated', async () => (itemsViewData.value = await getItemsViewData()));
});

function resetFilter(): void {
  quickFilter.value = '';
  nameSearchTerm.value = '';
  recipeSearchTerm.value = '';
  deconstructSearchTerm.value = '';
  selectedTags.value = [];
  usageItem.value = undefined;
  gainItem.value = undefined;
  clearTemporaryItems();
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

async function onNavigateToItem(event: MouseEvent, item: ItemPrefab, sourceViewData: ItemViewData): Promise<void> {
  await renderAll();
  const isTargetItemVisibleOnPage = visibleItems.value.find((i) => i.item.identifier === item.identifier);
  if (isTargetItemVisibleOnPage) {
    highLightOneItem(event, item.identifier);
    return;
  }
  setTemporaryItem(item, sourceViewData);
  event.preventDefault();
  setTimeout(() => highLightOneItem(event, item.identifier));
}
</script>

<style lang="scss" scoped>
@import './ItemsPage';
@import '/src/styles/common';
</style>
