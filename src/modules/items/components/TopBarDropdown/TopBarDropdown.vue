<template>
  <div ref="topBarDropdownRef" class="top-bar-dropdown-container">
    <button
      class="top-bar-button"
      :class="{ 'columns-dropdown-button-active': expanded, [buttonClass || '']: true }"
      @click="expanded = !expanded"
    />
    <div v-if="expanded" class="top-bar-dropdown" :class="dropdownClass">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useClickOutside } from '@compositions/use-click-outside';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ buttonClass?: string; dropdownClass?: string }>();

const topBarDropdownRef = ref<HTMLElement>();
const expanded = ref(false);

useClickOutside({
  element: topBarDropdownRef,
  whenToListen: expanded,
  clickOutsideCallback: () => (expanded.value = false),
});
</script>

<style lang="scss" scoped>
@import './TopBarDropdown';
</style>
