<template>
  <div class="quick-filter">
    <SearchInput ref="inputRef" v-if="expanded" class="quick-filter-input" placeholder="Search" v-model="value" />
    <button v-if="!expanded" class="search-button" type="button" @click="expanded = true" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue';

import SearchInput from '@components/SearchInput/SearchInput.vue';
import { useDebounce } from '@compositions/use-debounce';

const props = defineProps<{ modelValue?: string }>();
const emits = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const inputRef = ref<{ input: HTMLInputElement }>();
const expanded = ref(false);
const value = ref('');
const debouncedSearchTerm = useDebounce(value, { immediatelyClear: true });

watchEffect(() => (value.value = props.modelValue || ''));
watch(debouncedSearchTerm, () => emits('update:modelValue', debouncedSearchTerm.value));

watch(inputRef, () => {
  const inputElement = inputRef.value?.input;
  if (!inputElement) {
    return;
  }
  inputElement.focus();
});
</script>

<style lang="scss" scoped>
@import 'ItemQuickFilter';
</style>
