<template>
  <div class="items-page">
    <div class="items-top-bar">
      <ItemQuickFilter v-model="quickFilter" />
      <ColumnsDropdown v-model:columns="columnDefines" v-model:selectedColumns="selectedColumns" />
      <ColumnSettingModal v-model="columnSettings" />
    </div>
    <ItemTagsBar :viewDataArray="itemsViewData" v-model:selected="selectedTags" />

    <div class="items-container" :style="{ 'grid-template-columns': gridTemplateColumns }">
      <ItemListHeader
        :selectedColumns="selectedColumns"
        :columnsOrder="columnsOrder"
        v-model:nameSearchTerm="nameSearchTerm"
        v-model:recipeSearchTerm="recipeSearchTerm"
        v-model:deconstructSearchTerm="deconstructSearchTerm"
        v-model:priceSorting="priceSorting"
        @update:priceSorting="onSortingChange"
      />

      <ItemActionInfoRow
        :selectedColumns="selectedColumns"
        :gainItem="gainItem"
        :usageItem="usageItem"
        @reset="resetFilter"
      />

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
          <template v-if="!columnSettings.showCollectibleImage || !viewData.collectibleItemImages?.length">
            <ItemNameView :item="viewData.item" />
            <ItemTagsView :item="viewData" v-model:selectedTags="selectedTags" />
          </template>
          <CollectibleItemImage
            v-if="viewData.collectibleItemImages?.length"
            :item="viewData"
            :showCollectibleImage="columnSettings.showCollectibleImage"
            @toggleView="columnSettings.showCollectibleImage = !columnSettings.showCollectibleImage"
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
          <ItemPriceView :viewData="viewData" :detail="columnSettings.showPriceDetail" />
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

import ItemImage from '@components/ItemImage/ItemImage.vue';
import { useMitt } from '@compositions/use-mitt';
import { intersectionDirectiveFactory } from '@directives/IntersectionDirective';
import { SettingKey } from '@enums/setting-key';
import { SortDirection } from '@enums/sort-direction';
import { ColumnDefine } from '@interfaces/columnDefine';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';
import CollectibleItemImage from '@modules/items/components/CollectibleItemImage/CollectibleItemImage.vue';
import ColumnsDropdown from '@modules/items/components/ColumnsDropdown/ColumnsDropdown.vue';
import ColumnSettingModal from '@modules/items/components/ColumnSettingModal/ColumnSettingModal.vue';
import DeconstructRecipeView from '@modules/items/components/DeconstructRecipeView/DeconstructRecipeView.vue';
import FabricationRecipeView from '@modules/items/components/FabricationRecipeView/FabricationRecipeView.vue';
import ItemActionInfoRow from '@modules/items/components/ItemActionInfoRow/ItemActionInfoRow.vue';
import ItemListHeader from '@modules/items/components/ItemListHeader/ItemListHeader.vue';
import ItemNameView from '@modules/items/components/ItemNameView/ItemNameView.vue';
import ItemPriceView from '@modules/items/components/ItemPriceView/ItemPriceView.vue';
import ItemQuickFilter from '@modules/items/components/ItemQuickFilter/ItemQuickFilter.vue';
import ItemTagsBar from '@modules/items/components/ItemTagsBar/ItemTagsBar.vue';
import ItemTagsView from '@modules/items/components/ItemTagsView/ItemTagsView.vue';
import { useColumnSettings } from '@modules/items/compositions/use-column-settings';
import { useFilterItem, ItemFilterCondition } from '@modules/items/compositions/use-filter-item';
import { useHighlightItem } from '@modules/items/compositions/use-highlight-item';
import { useItemsSorting, ItemSorts } from '@modules/items/compositions/use-items-sorting';
import { useLazyRender } from '@modules/items/compositions/use-lazy-render';
import { useProvideLocaleFile } from '@modules/items/compositions/use-provide-locale-file';
import { useTemporaryItem } from '@modules/items/compositions/use-temporary-item';
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

const columnSettings = useColumnSettings();

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
