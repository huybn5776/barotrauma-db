<template>
  <div class="item-tags-bar">
    <div class="item-tags-container" :class="{ 'tags-expanded': expanded }">
      <div class="item-tag-overflow-container">
        <button
          v-for="{ tag, count } of tagCounts"
          :key="tag"
          class="item-tag"
          :class="{ 'selected-tag': selected.includes(tag) }"
          @click="toggleSelected(tag)"
        >
          <span>{{ tag }}</span>
          <span> / </span>
          <span>{{ count }}</span>
        </button>
      </div>
    </div>
    <div v-if="tagCounts?.length" class="tags-right-container">
      <button class="tags-expand-button" title="expand" @click="expanded = !expanded">
        <ChevronArrow :direction="expanded ? 'up' : 'down'" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';

import { countBy, sortBy, without } from 'ramda';

import ChevronArrow from '@components/ChevronArrow/ChevronArrow.vue';
import { ItemViewData } from '@interfaces/item-view-data';
import { isNotNilOrEmpty } from '@utils/object-utils';

const props = defineProps<{ viewDataArray: ItemViewData[]; selected?: string[] }>();
const emits = defineEmits<{ (e: 'update:selected', value: string[]): void }>();

const selected = ref<string[]>([]);
const expanded = ref(false);

watchEffect(() => (selected.value = props.selected || []));

const tagCounts = computed<{ tag: string; count: number }[]>(() => {
  const tagsList = props.viewDataArray.flatMap((viewData) => viewData.item.tags).filter(isNotNilOrEmpty);
  const countedTags = countBy((tag) => tag, tagsList);
  return sortBy(([, count]) => count, Object.entries(countedTags))
    .reverse()
    .map(([tag, count]) => ({ tag, count }));
});

function toggleSelected(tag: string): void {
  if (selected.value.includes(tag)) {
    selected.value = without([tag], selected.value);
  } else {
    selected.value = [...selected.value, tag];
  }
  emits('update:selected', selected.value);
}
</script>

<style lang="scss" scoped>
@import './ItemTagsBar';
</style>
