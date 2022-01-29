import { computed, ComputedRef, Ref } from 'vue';

import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';

export interface ItemFilterCondition {
  name?: string;
  recipe?: string;
  deconstruct?: string;
  gainItemId?: string;
  usageItemId?: string;
}

export function useFilterItem(
  viewDataArrayRef: Ref<ItemViewData[]>,
  filter: Ref<ItemFilterCondition>,
): ComputedRef<ItemViewData[]> {
  return computed(() => {
    const { name, recipe, deconstruct, usageItemId, gainItemId } = filter.value;
    if (!name && !recipe && !deconstruct && !usageItemId && !gainItemId) {
      return viewDataArrayRef.value;
    }
    return viewDataArrayRef.value.filter((itemViewData) => {
      return (
        filterByName(itemViewData.item, name) &&
        filterByRecipe(itemViewData, recipe) &&
        filterByDeconstruct(itemViewData, deconstruct)
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
