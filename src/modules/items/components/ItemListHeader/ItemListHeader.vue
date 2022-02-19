<template>
  <span
    v-if="selectedColumns.includes('image')"
    class="items-grid-header normal-header"
    :style="{ order: columnsOrder.indexOf('image') }"
    :class="{ 'empty-header': columnsOrder.indexOf('image') === 0 }"
  >
    Image
  </span>
  <div class="items-grid-header" :style="{ order: columnsOrder.indexOf('name') }">
    <SearchInput
      class="item-column-filter-input"
      placeholder="Name"
      :model="nameSearchTerm"
      @update:modelValue="emits('update:nameSearchTerm', $event)"
    />
  </div>
  <div
    v-if="selectedColumns.includes('recipe')"
    class="items-grid-header"
    :style="{ order: columnsOrder.indexOf('recipe') }"
  >
    <SearchInput
      class="item-column-filter-input"
      placeholder="Recipe"
      :model="recipeSearchTerm"
      @update:modelValue="emits('update:recipeSearchTerm', $event)"
    />
  </div>
  <div
    v-if="selectedColumns.includes('deconstruct')"
    class="items-grid-header"
    :style="{ order: columnsOrder.indexOf('deconstruct') }"
  >
    <SearchInput
      class="item-column-filter-input"
      placeholder="Deconstruct"
      :model="deconstructSearchTerm"
      @update:modelValue="emits('update:deconstructSearchTerm', $event)"
    />
  </div>
  <SortableColumnHeader
    v-if="selectedColumns.includes('price')"
    class="items-grid-header"
    :style="{ order: columnsOrder.indexOf('price') }"
    :sort="priceSorting"
    @update:sort="emits('update:priceSorting', $event)"
  >
    Price
  </SortableColumnHeader>
  <span
    v-if="selectedColumns.includes('action')"
    class="items-grid-header normal-header"
    :style="{ order: columnsOrder.indexOf('action') }"
    :class="{ 'empty-header': columnsOrder.indexOf('action') === columnsOrder.length - 1 }"
  >
    Actions
  </span>
</template>

<script lang="ts" setup>
import SearchInput from '@components/SearchInput/SearchInput.vue';
import { SortDirection } from '@enums/sort-direction';
import SortableColumnHeader from '@modules/items/components/SortableColumnHeader/SortableColumnHeader.vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  selectedColumns: string[];
  columnsOrder: string[];
  nameSearchTerm: string;
  recipeSearchTerm: string;
  deconstructSearchTerm: string;
  priceSorting: SortDirection | undefined;
}>();
const emits = defineEmits<{
  (e: 'update:recipeSearchTerm', value: string): void;
  (e: 'update:nameSearchTerm', value: string): void;
  (e: 'update:deconstructSearchTerm', value: string): void;
  (e: 'update:priceSorting', value: SortDirection | undefined): void;
}>();
</script>

<style lang="scss" scoped>
@import './ItemListHeader';
</style>
