<template>
  <div class="items-page">
    <div class="items-top-bar">
      <ItemQuickFilter v-model="quickFilter" />
      <ColumnsDropdown v-model:columns="columnDefines" v-model:selectedColumns="selectedColumns" />
    </div>
    <ItemTagsBar :viewDataArray="itemsViewData" v-model:selected="selectedTags" />

    <div class="items-container" :style="{ 'grid-template-columns': gridTemplateColumns }">
      <span
        v-if="selectedColumns.includes('image')"
        class="items-grid-header normal-header"
        :style="{ order: columnsOrder.indexOf('image') }"
        :class="{ 'empty-header': columnsOrder.indexOf('image') === 0 }"
      >
        Image
      </span>
      <div class="items-grid-header" :style="{ order: columnsOrder.indexOf('name') }">
        <SearchInput class="item-column-filter-input" placeholder="Name" v-model="nameSearchTerm" />
      </div>
      <div
        v-if="selectedColumns.includes('recipe')"
        class="items-grid-header"
        :style="{ order: columnsOrder.indexOf('recipe') }"
      >
        <SearchInput class="item-column-filter-input" placeholder="Recipe" v-model="recipeSearchTerm" />
      </div>
      <div
        v-if="selectedColumns.includes('deconstruct')"
        class="items-grid-header"
        :style="{ order: columnsOrder.indexOf('deconstruct') }"
      >
        <SearchInput class="item-column-filter-input" placeholder="Deconstruct" v-model="deconstructSearchTerm" />
      </div>
      <SortableColumnHeader
        v-if="selectedColumns.includes('price')"
        class="items-grid-header"
        :style="{ order: columnsOrder.indexOf('price') }"
        v-model:sort="priceSorting"
        @update:sort="onSortingChange"
      >
        Price
      </SortableColumnHeader>
      <span
        v-if="selectedColumns.includes('action')"
        class="items-grid-header normal-header"
        :style="{ order: columnsOrder.indexOf('action') }"
        :class="{ 'empty-header': columnsOrder.indexOf('action') === columnsOrder.length - 1 }"
      >
        Actions
      </span>

      <template v-if="gainItem">
        <div v-if="selectedColumns.includes('image')" class="gain-item-image" style="order: 7">
          <ItemImage :item="gainItem?.item" :size="32" />
        </div>
        <ItemGainView
          v-if="gainItem"
          style="order: 8"
          :style="{ 'grid-column': gainViewGridColumn }"
          :item="gainItem"
        />
        <div class="item-actions" style="order: 9">
          <button class="b-button item-action-button" @click="resetFilter">Reset</button>
        </div>
      </template>
      <template v-if="usageItem">
        <div class="gain-item-image" style="order: 7">
          <ItemImage :item="usageItem?.item" :size="32" />
        </div>
        <ItemUsageView
          v-if="usageItem"
          style="order: 8"
          :style="{ 'grid-column': gainViewGridColumn }"
          :item="usageItem"
        />
        <div class="item-actions" style="order: 9">
          <button class="b-button item-action-button" @click="resetFilter">Reset</button>
        </div>
      </template>

      <template v-for="(viewData, index) of itemsToShow" :key="viewData.item.identifier">
        <div
          v-if="selectedColumns.includes('image')"
          class="item-cell item-image"
          :style="{ order: (index + 1) * 10 + columnsOrder.indexOf('image') }"
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
          :style="{ order: (index + 1) * 10 + columnsOrder.indexOf('name') }"
          :id="viewData.item.identifier"
          :class="{
            'highlight-item': highlightItem === viewData.item.identifier,
            'temporary-row': viewData.isTemporaryRow,
          }"
        >
          <ItemNameView v-if="!showCollectibleImage || !viewData.collectibleItemImages?.length" :item="viewData.item" />
          <ItemTagsView :item="viewData" v-model:selectedTags="selectedTags" />
          <CollectibleItemImage
            v-if="viewData.collectibleItemImages?.length"
            :item="viewData"
            :showCollectibleImage="showCollectibleImage"
            @toggleView="showCollectibleImage = !showCollectibleImage"
          />
        </div>

        <div
          class="item-cell item-recipe"
          v-if="selectedColumns.includes('recipe')"
          :style="{ order: (index + 1) * 10 + columnsOrder.indexOf('recipe') }"
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
          v-if="selectedColumns.includes('deconstruct')"
          :style="{ order: (index + 1) * 10 + columnsOrder.indexOf('deconstruct') }"
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
          v-if="selectedColumns.includes('price')"
          class="item-cell"
          :style="{ order: (index + 1) * 10 + columnsOrder.indexOf('price') }"
          :class="{
            'highlight-item': highlightItem === viewData.item.identifier,
            'temporary-row': viewData.isTemporaryRow,
          }"
        >
          <ItemPriceView :item="viewData.item" />
        </div>

        <div
          v-if="selectedColumns.includes('action')"
          class="item-cell item-actions"
          :style="{ order: (index + 1) * 10 + columnsOrder.indexOf('action') }"
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
        :style="{
          height: `${fillUpHeight}px`,
          order: Number.MAX_SAFE_INTEGER,
          'grid-column': `1 / ${selectedColumns.length + 1}`,
        }"
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
import ColumnsDropdown from '@components/ColumnsDropdown/ColumnsDropdown.vue';
import DeconstructRecipeView from '@components/DeconstructRecipeView/DeconstructRecipeView.vue';
import FabricationRecipeView from '@components/FabricationRecipeView/FabricationRecipeView.vue';
import ItemGainView from '@components/ItemGainView/ItemGainView.vue';
import ItemImage from '@components/ItemImage/ItemImage.vue';
import ItemNameView from '@components/ItemNameView.vue';
import ItemPriceView from '@components/ItemPriceView/ItemPriceView.vue';
import ItemQuickFilter from '@components/ItemQuickFilter/ItemQuickFilter.vue';
import ItemTagsBar from '@components/ItemTagsBar/ItemTagsBar.vue';
import ItemTagsView from '@components/ItemTagsView/ItemTagsView.vue';
import ItemUsageView from '@components/ItemUsageView/ItemUsageView.vue';
import SearchInput from '@components/SearchInput/SearchInput.vue';
import SortableColumnHeader from '@components/SortableColumnHeader/SortableColumnHeader.vue';
import { useFilterItem, ItemFilterCondition } from '@compositions/use-filter-item';
import { useHighlightItem } from '@compositions/use-highlight-item';
import { useItemsSorting, ItemSorts } from '@compositions/use-items-sorting';
import { useLazyRender } from '@compositions/use-lazy-render';
import { useMitt } from '@compositions/use-mitt';
import { useProvideLocaleFile } from '@compositions/use-provide-locale-file';
import { useTemporaryItem } from '@compositions/use-temporary-item';
import { intersectionDirectiveFactory } from '@directives/IntersectionDirective';
import { SettingKey } from '@enums/setting-key';
import { SortDirection } from '@enums/sort-direction';
import { ColumnDefine } from '@interfaces/columnDefine';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';
import { DataConvertContext, itemsToViewData } from '@services/data-convert-service';
import { getAllItemsAndLocale, filterAvailableItems } from '@services/data-source-service';
import { getSettingFromStorage } from '@utils/storage-utils';

const { onEvent } = useMitt();

const vItemIntersection = intersectionDirectiveFactory({ threshold: 0.1 });
const vPaddingIntersection = intersectionDirectiveFactory({ threshold: 0 });
useProvideLocaleFile();

const columnDefines = ref<ColumnDefine[]>([
  { id: 'image', label: 'Image' },
  { id: 'name', label: 'Name', disableHide: true },
  { id: 'recipe', label: 'Recipe' },
  { id: 'deconstruct', label: 'Deconstruct' },
  { id: 'price', label: 'Price' },
  { id: 'action', label: 'Action' },
]);
const columnsOrder = computed(() => columnDefines.value.map(({ id }) => id));
const selectedColumns = ref<string[]>(columnDefines.value.map((column) => column.id));
const gainViewGridColumn = computed(() => {
  const start = +selectedColumns.value.includes('image') + 1;
  const columnSpan =
    start +
    +selectedColumns.value.includes('recipe') +
    +selectedColumns.value.includes('deconstruct') +
    +selectedColumns.value.includes('price') +
    1;
  return `${start} / ${columnSpan}`;
});
const gridWidths: Record<string, string> = {
  image: 'auto',
  name: 'minmax(120px, max-content)',
  recipe: 'max-content',
  deconstruct: 'max-content',
  price: 'max-content',
  action: '72px',
};
const gridTemplateColumns = computed(() => {
  return columnDefines.value
    .filter((column) => selectedColumns.value.includes(column.id))
    .map((column) => gridWidths[column.id])
    .join(' ');
});

const quickFilter = ref('');
const nameSearchTerm = ref('');
const recipeSearchTerm = ref('');
const deconstructSearchTerm = ref('');
const selectedTags = ref<string[]>([]);
const priceSorting = ref<SortDirection>();

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
const itemSorting = computed<ItemSorts>(() => ({
  price: priceSorting.value,
}));

const itemsViewData = ref<ItemViewData[]>([]);
const visibleItems = useFilterItem(itemsViewData, itemFilter);
const sortedItems = useItemsSorting(visibleItems, itemSorting);
const {
  visibleItemsWithInsert: itemsWithTemporaryItems,
  setTemporaryItem,
  clearTemporaryItems,
} = useTemporaryItem(sortedItems, itemsViewData);
const { lazyRenderItems, fillUpHeight, onItemRowEnter, onLazyRenderPaddingVisible, renderAll } = useLazyRender(
  sortedItems,
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

function onSortingChange(): void {
  clearTemporaryItems();
}
</script>

<style lang="scss" scoped>
@import './ItemsPage';
@import '/src/styles/common';
</style>
