<template>
  <div class="search-input-container">
    <label class="search-input-label" :class="{ 'empty-input': !value }">
      <input
        class="search-input"
        type="text"
        :placeholder="placeholder"
        v-model.trim="value"
        @focus="focused = true"
        @blur="focused = false"
      />
    </label>
    <button
      class="input-clear-button"
      type="button"
      :class="{ 'hide-clear-button': !value }"
      aria-label="clear"
      @click="value = ''"
    >
      ×
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, watchEffect } from 'vue';

import { useDebounce } from '@compositions/use-debounce';

const props = defineProps<{ modelValue?: string; placeholder: string }>();
const emits = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const focused = ref(false);
const value = ref('');
const placeholder = computed<string | undefined>(() => (focused.value ? undefined : props.placeholder));
const debouncedValue = useDebounce(value, { immediatelyClear: true });

watchEffect(() => {
  value.value = props.modelValue || '';
});
watch(debouncedValue, () => {
  emits('update:modelValue', debouncedValue.value);
});
</script>

<style lang="scss" scoped>
@import './SearchInput';
</style>
