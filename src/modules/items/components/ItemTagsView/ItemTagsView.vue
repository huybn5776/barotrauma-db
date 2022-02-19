<template>
  <div v-if="item.item.tags?.length" class="item-tags">
    <button
      v-for="{ tag, selected } of tagsView"
      :key="tag"
      class="item-tag"
      type="button"
      :class="{ 'item-tag-selected': selected }"
      @click="toggleTag(tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { ItemViewData } from '@interfaces/item-view-data';

const props = defineProps<{ item: ItemViewData; selectedTags?: string[] }>();
const emits = defineEmits<{ (e: 'update:selectedTags', value: string[]): void }>();

const tagsView = computed(() =>
  props.item.item.tags?.map((tag) => ({ tag, selected: props.selectedTags?.includes(tag) })),
);

function toggleTag(tag: string): void {
  const tags = props.selectedTags?.includes(tag)
    ? props.selectedTags.filter((t) => t !== tag)
    : [...(props.selectedTags || []), tag];
  emits('update:selectedTags', tags);
}
</script>

<style lang="scss" scoped>
@import './ItemTagsView';
</style>
