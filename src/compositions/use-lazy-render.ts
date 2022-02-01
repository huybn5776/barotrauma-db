import { ref, watch, Ref, ComputedRef, computed } from 'vue';

import { ItemViewData } from '@interfaces/item-view-data';

const renderOnceAmount = 10;
const preRenderAmount = renderOnceAmount * 2;

export function useLazyRender(
  visibleItems: Ref<ItemViewData[]>,
  itemsWithTemporaryItems: Ref<ItemViewData[]>,
): {
  lazyRenderItems: ComputedRef<ItemViewData[]>;
  fillUpHeight: Ref<number | undefined>;
  onItemRowEnter: (viewData: ItemViewData) => void;
  onLazyRenderPaddingVisible: () => void;
  renderAll: () => Promise<void>;
} {
  const itemMinHeight = 72;
  const lastRenderIndex = ref(0);
  const fillUpHeight = ref<number>();
  const lazyRenderItems = computed(() =>
    itemsWithTemporaryItems.value.slice(0, lastRenderIndex.value + preRenderAmount),
  );

  watch(visibleItems, () => {
    lastRenderIndex.value = 0;
    fillUpHeight.value = 0;
  });

  function onItemRowEnter(viewData: ItemViewData): void {
    const items = itemsWithTemporaryItems.value;
    const index = items.indexOf(viewData);
    const nextRenderIndex = Math.min(
      items.length,
      Math.ceil((index + preRenderAmount) / renderOnceAmount) * renderOnceAmount,
    );
    lastRenderIndex.value = Math.max(lastRenderIndex.value, nextRenderIndex);
    fillUpHeight.value = Math.max(0, (items.length - 1 - lastRenderIndex.value) * itemMinHeight);
  }

  function onLazyRenderPaddingVisible(): void {
    const items = itemsWithTemporaryItems.value;
    lastRenderIndex.value = items.length;
    fillUpHeight.value = 0;
  }

  async function renderAll(): Promise<void> {
    if (lastRenderIndex.value < visibleItems.value.length) {
      lastRenderIndex.value = visibleItems.value.length;
      fillUpHeight.value = 0;
      return new Promise((resolve) => {
        setTimeout(resolve);
      });
    }
    return Promise.resolve();
  }

  return { lazyRenderItems, fillUpHeight, onItemRowEnter, onLazyRenderPaddingVisible, renderAll };
}
