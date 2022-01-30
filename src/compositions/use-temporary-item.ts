import { computed, Ref, ref, ComputedRef } from 'vue';

import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';

export function useTemporaryItem(
  viewDataArrayRef: Ref<ItemViewData[]>,
  itemsViewDataRef: Ref<ItemViewData[]>,
): {
  clearTemporaryItems: () => void;
  setTemporaryItem: (item: ItemPrefab, insertAfterItem: ItemViewData) => void;
  visibleItemsWithInsert: ComputedRef<ItemViewData[]>;
} {
  const insertItems = ref<{ viewDataToInsert: ItemViewData; insertAfterItemId: string }[]>([]);
  const visibleItemsWithInsert = computed(() => {
    if (!insertItems.value.length) {
      return viewDataArrayRef.value;
    }
    const insertedVisibleItems = [...viewDataArrayRef.value];
    insertItems.value.forEach(({ viewDataToInsert, insertAfterItemId }) => {
      const index = insertedVisibleItems.findIndex(({ item }) => item.identifier === insertAfterItemId);
      if (index !== -1) {
        insertedVisibleItems.splice(index + 1, 0, { ...viewDataToInsert, isTemporaryRow: true });
      }
    });
    return insertedVisibleItems;
  });

  function showTemporaryItem(item: ItemPrefab, insertAfterItem: ItemViewData): void {
    const viewDataToInsert = itemsViewDataRef.value.find(({ item: { identifier } }) => identifier === item.identifier);
    if (!viewDataToInsert) {
      return;
    }
    if (insertAfterItem.isTemporaryRow && insertItems.value.length) {
      const temporaryItemAlreadyExist = insertItems.value.some(
        (i) => i.viewDataToInsert.item.identifier === item.identifier,
      );
      if (temporaryItemAlreadyExist) {
        return;
      }
      const lastInsertedItem = insertItems.value[insertItems.value.length - 1];
      insertItems.value = [
        ...insertItems.value,
        { viewDataToInsert, insertAfterItemId: lastInsertedItem.viewDataToInsert.item.identifier },
      ];
    } else {
      insertItems.value = [{ viewDataToInsert, insertAfterItemId: insertAfterItem.item.identifier }];
    }
  }

  function clearTemporaryItems(): void {
    insertItems.value = [];
  }

  return { visibleItemsWithInsert, setTemporaryItem: showTemporaryItem, clearTemporaryItems };
}
