<template>
  <label class="search-input-container" :class="{ 'empty-input': !value }">
    <input
      class="search-input"
      type="text"
      :placeholder="placeholder"
      v-model.trim="value"
      @focus="focused = true"
      @blur="focused = false"
    />
    <button class="input-clear-button" type="button" :class="{ 'hide-clear-button': !value }" aria-label="clear">
      ×
    </button>
  </label>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { useDebounce } from '@compositions/use-debounce';

const props = defineProps<{ placeholder: string }>();
const emits = defineEmits<{ (e: 'value', value: string): void }>();

const focused = ref(false);
const value = ref('');
const placeholder = computed<string | undefined>(() => (focused.value ? undefined : props.placeholder));
const debouncedValue = useDebounce(value, { immediatelyClear: true });

watch(debouncedValue, () => emits('value', debouncedValue.value));
</script>

<style lang="scss" scoped>
@import './SearchInput';
</style>
