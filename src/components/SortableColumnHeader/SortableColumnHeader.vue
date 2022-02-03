<template>
  <button class="sortable-column-header" type="button" @click="toggleSort">
    <slot />
    <i
      class="sort-icon"
      :class="{
        'sort-icon-up': sort === SortDirection.Asc,
        'sort-icon-down': sort === SortDirection.Desc,
        'sort-icon-up-down': !sort,
      }"
    />
  </button>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

import { SortDirection } from '@enums/sort-direction';

const sorts = [undefined, SortDirection.Desc, SortDirection.Asc];

const props = defineProps<{ sort?: SortDirection | undefined }>();
const emits = defineEmits<{ (e: 'update:sort', value: SortDirection | undefined): void }>();

const sort = ref<SortDirection>();

watchEffect(() => (sort.value = props.sort));

function toggleSort(): void {
  const nextSortIndex = (sorts.indexOf(sort.value) + 1) % sorts.length;
  sort.value = sorts[nextSortIndex];
  emits('update:sort', sort.value);
}
</script>

<style lang="scss" scoped>
@import './SortableColumnHeader';
</style>
