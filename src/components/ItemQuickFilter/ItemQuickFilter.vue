<template>
  <div class="quick-filter">
    <SearchInput ref="inputRef" v-if="expanded" class="quick-filter-input" placeholder="Search" v-model="value" />
    <button v-if="!expanded" class="search-button" type="button" @click="expanded = true" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, watchEffect, onMounted } from 'vue';

import { fromEvent, filter, take, takeUntil, switchMapTo } from 'rxjs';

import SearchInput from '@components/SearchInput/SearchInput.vue';
import { useDebounce } from '@compositions/use-debounce';
import { useUntilDestroyed } from '@compositions/use-until-destroyed';

const props = defineProps<{ modelValue?: string }>();
const emits = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const inputRef = ref<{ input: HTMLInputElement }>();
const expanded = ref(false);
const value = ref('');
const debouncedSearchTerm = useDebounce(value, { immediatelyClear: true });

const untilDestroyed = useUntilDestroyed();
const searchHotKey$ = fromEvent<KeyboardEvent>(document.body, 'keydown').pipe(
  filter((event) => (event.metaKey || event.ctrlKey) && event.code === 'KeyF'),
  untilDestroyed(),
);

onMounted(() => {
  searchHotKey$.pipe(take(1)).subscribe((event) => {
    expanded.value = true;
    event.preventDefault();
  });
});

watchEffect(() => (value.value = props.modelValue || ''));
watch(debouncedSearchTerm, () => emits('update:modelValue', debouncedSearchTerm.value));

watch(inputRef, () => {
  const inputElement = inputRef.value?.input;
  if (!inputElement) {
    return;
  }
  inputElement.focus();
  fromEvent(inputElement, 'blur')
    .pipe(switchMapTo(searchHotKey$.pipe(take(1), takeUntil(fromEvent(inputElement, 'focus')))), untilDestroyed())
    .subscribe((event) => {
      if (inputRef.value?.input) {
        inputRef.value?.input.focus();
        event.preventDefault();
      }
    });
});
</script>

<style lang="scss" scoped>
@import 'ItemQuickFilter';
</style>
