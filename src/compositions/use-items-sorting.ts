import { Ref, computed } from 'vue';

import { descend, sortWith, Ordering, ascend } from 'ramda';

import { SortDirection } from '@enums/sort-direction';
import { ItemViewData } from '@interfaces/item-view-data';

export type ItemSorts = Partial<Record<SortableFields, SortDirection | undefined>>;

type SortableFields = 'price';
type ViewDataComparator = (v1: ItemViewData, v2: ItemViewData) => Ordering;

export function useItemsSorting(visibleItems: Ref<ItemViewData[]>, sorting: Ref<ItemSorts>): Ref<ItemViewData[]> {
  return computed<ItemViewData[]>(() => {
    const comparators: ViewDataComparator[] = [];
    if (sorting.value.price) {
      const priceGetter = (item: ItemViewData): number => item.item.price?.basePrice || 0;
      comparators.push(sorting.value.price === SortDirection.Asc ? ascend(priceGetter) : descend(priceGetter));
    }
    return sortWith(comparators, visibleItems.value);
  });
}
