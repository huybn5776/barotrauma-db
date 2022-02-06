<template>
  <div ref="columnsDropdownRef" class="columns-dropdown-container">
    <button
      class="columns-dropdown-button"
      :class="{ 'columns-dropdown-button-active': expanded }"
      @click="expanded = !expanded"
    />

    <ListDragSort
      v-if="expanded"
      class="column-rows"
      :class="{ 'column-row-dragging': columnsDragging }"
      :items="columnsRows"
      @dragging="columnsDragging = $event"
      @update:items="onSortChanged"
      v-slot:default="{ item }"
    >
      <button class="column-toggle-button" type="button" @click="toggleSelected(asColumnInfo(item).column)">
        <span>{{ asColumnInfo(item).column.label }}</span>
        <NSwitch :value="asColumnInfo(item).selected" :disabled="asColumnInfo(item).column.disableHide" />
      </button>
    </ListDragSort>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import { NSwitch } from 'naive-ui';

import ListDragSort from '@components/ListDragSort/ListDragSort.vue';
import { useClickOutside } from '@compositions/use-click-outside';
import { ColumnDefine } from '@interfaces/columnDefine';
import { toggleEntry } from '@utils/array-utils';

interface ColumnDefineWithSelected {
  column: ColumnDefine;
  selected: boolean;
}

const props = defineProps<{ columns: ColumnDefine[]; selectedColumns: string[] }>();
const emits = defineEmits<{
  (e: 'update:columns', value: ColumnDefine[]): void;
  (e: 'update:selectedColumns', value: string[]): void;
}>();

const columnsDropdownRef = ref<HTMLElement>();
const columnsRows = computed(() => {
  return props.columns.map((column) => ({
    id: column.id,
    column,
    selected: props.selectedColumns.includes(column.id),
  }));
});
const expanded = ref(false);
const columnsDragging = ref(false);

useClickOutside({
  element: columnsDropdownRef,
  whenToListen: expanded,
  clickOutsideCallback: () => (expanded.value = false),
});

function onSortChanged(columnsInfo: object[]): void {
  const items = columnsInfo as ColumnDefineWithSelected[];
  const columns = items.map(({ column }) => column);
  emits('update:columns', columns);
}

function toggleSelected(column: ColumnDefine): void {
  const updatedColumns = toggleEntry(props.selectedColumns, column.id);
  emits('update:selectedColumns', updatedColumns);
}

function asColumnInfo(item: object): ColumnDefineWithSelected {
  return item as { column: ColumnDefine; selected: boolean };
}
</script>

<style lang="scss" scoped>
@import './ColumnsDropdown';
</style>
