<template>
  <div class="quick-filter">
    <SearchInput ref="inputRef" class="quick-filter-input" placeholder="Search" v-model="value" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, watchEffect, onMounted } from 'vue';

import { fromEvent, filter, take, takeUntil, switchMapTo, startWith } from 'rxjs';

import SearchInput from '@components/SearchInput/SearchInput.vue';
import { useDebounce } from '@compositions/use-debounce';
import { useUntilDestroyed } from '@compositions/use-until-destroyed';

const props = defineProps<{ modelValue?: string }>();
const emits = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const inputRef = ref<{ input: HTMLInputElement }>();
const value = ref('');
const debouncedSearchTerm = useDebounce(value, { immediatelyClear: true });

const untilDestroyed = useUntilDestroyed();

watchEffect(() => (value.value = props.modelValue || ''));
watch(debouncedSearchTerm, () => emits('update:modelValue', debouncedSearchTerm.value));

onMounted(() => {
  const inputElement = inputRef.value?.input;
  if (!inputElement) {
    return;
  }
  const searchHotkey$ = fromEvent<KeyboardEvent>(document.body, 'keydown')
    .pipe(
      filter((event) => (event.metaKey || event.ctrlKey) && event.code === 'KeyF'),
      untilDestroyed(),
    )
    .pipe(take(1), takeUntil(fromEvent(inputElement, 'focus')));

  fromEvent(inputElement, 'blur')
    .pipe(startWith(undefined), switchMapTo(searchHotkey$), untilDestroyed())
    .subscribe((event) => {
      inputElement.focus();
      event.preventDefault();
    });
});
</script>

<style lang="scss" scoped>
@import 'ItemQuickFilter';
</style>
