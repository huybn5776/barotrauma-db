import { computed, ComputedRef, Ref } from 'vue';

import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';
import { isNotNilOrEmpty } from '@utils/object-utils';

export interface ItemFilterCondition {
  quickFilter?: string;
  name?: string;
  recipe?: string;
  deconstruct?: string;
  tags?: string[];
  gainItemId?: string;
  usageItemId?: string;
}

export function useFilterItem(
  viewDataArrayRef: Ref<ItemViewData[]>,
  filter: Ref<ItemFilterCondition>,
): ComputedRef<ItemViewData[]> {
  return computed(() => {
    const { quickFilter, name, tags, recipe, deconstruct, usageItemId, gainItemId } = filter.value;
    if (!quickFilter && !name && !tags?.length && !recipe && !deconstruct && !usageItemId && !gainItemId) {
      return viewDataArrayRef.value;
    }
    return viewDataArrayRef.value.filter((itemViewData) => {
      return (
        filterByQuickFilter(itemViewData, quickFilter?.toLowerCase()) &&
        filterByName(itemViewData.item, name?.toLowerCase()) &&
        filterByRecipe(itemViewData, recipe?.toLowerCase()) &&
        filterByDeconstruct(itemViewData, deconstruct?.toLowerCase()) &&
        filterByTags(itemViewData.item, tags) &&
        filterByGain(itemViewData, gainItemId) &&
        filterByUsage(itemViewData, usageItemId)
      );
    });
  });
}

function filterByQuickFilter(viewData: ItemViewData, quickFilter: string | undefined): boolean | undefined {
  return (
    !quickFilter ||
    filterByName(viewData.item, quickFilter) ||
    filterByRecipe(viewData, quickFilter) ||
    filterByDeconstruct(viewData, quickFilter)
  );
}

function filterByName(item: ItemPrefab, term: string | undefined): boolean | undefined {
  return (
    !term || item.name?.toLowerCase().includes(term) || item.englishName?.toLowerCase()?.includes(term.toLowerCase())
  );
}

function filterByRecipe(itemViewData: ItemViewData, term: string | undefined): boolean | undefined {
  return (
    !term ||
    itemViewData.fabricationRecipes.some((fabricationRecipe) => {
      return (
        fabricationRecipe.displayName?.toLowerCase().includes(term) ||
        fabricationRecipe.items.some(({ item }) => filterByName(item, term))
      );
    })
  );
}

function filterByDeconstruct(itemViewData: ItemViewData, term: string | undefined): boolean | undefined {
  return !term || itemViewData.deconstructRecipe?.items.some(({ item }) => filterByName(item, term));
}

function filterByTags(item: ItemPrefab, tags: string[] | undefined): boolean | undefined {
  return !tags?.length || tags.some((tag) => item.tags?.includes(tag));
}

function filterByGain(itemViewData: ItemViewData, gainItemId: string | undefined): boolean | undefined {
  return (
    !gainItemId ||
    (itemViewData.item.identifier === gainItemId && isNotNilOrEmpty(itemViewData.item.fabricationRecipes)) ||
    itemViewData.deconstructRecipe?.items.some(({ item }) => item.identifier === gainItemId)
  );
}

function filterByUsage(itemViewData: ItemViewData, usageItemId: string | undefined): boolean | undefined {
  return (
    !usageItemId ||
    (itemViewData.item.identifier === usageItemId && isNotNilOrEmpty(itemViewData.item.deconstructItems)) ||
    itemViewData.fabricationRecipes.some((fabricationRecipe) =>
      fabricationRecipe.items.some(({ item }) => item.identifier === usageItemId),
    )
  );
}
