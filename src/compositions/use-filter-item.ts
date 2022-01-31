import { computed, ComputedRef, Ref } from 'vue';

import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';
import { isNotNilOrEmpty } from '@utils/object-utils';

export interface ItemFilterCondition {
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
    const { name, tags, recipe, deconstruct, usageItemId, gainItemId } = filter.value;
    if (!name && !tags?.length && !recipe && !deconstruct && !usageItemId && !gainItemId) {
      return viewDataArrayRef.value;
    }
    return viewDataArrayRef.value.filter((itemViewData) => {
      return (
        filterByName(itemViewData.item, name) &&
        filterByRecipe(itemViewData, recipe) &&
        filterByDeconstruct(itemViewData, deconstruct) &&
        filterByTags(itemViewData.item, tags) &&
        filterByGain(itemViewData, gainItemId) &&
        filterByUsage(itemViewData, usageItemId)
      );
    });
  });
}

function filterByName(item: ItemPrefab, term: string | undefined): boolean | undefined {
  return !term || item.name?.includes(term) || item.englishName?.includes(term);
}

function filterByRecipe(itemViewData: ItemViewData, term: string | undefined): boolean | undefined {
  return (
    !term ||
    itemViewData.fabricationRecipes.some((fabricationRecipe) => {
      return (
        fabricationRecipe.displayName?.includes(term) ||
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
