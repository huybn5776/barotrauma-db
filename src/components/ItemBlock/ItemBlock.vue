<template>
  <div class="item-block" :key="label" :class="{ active: active, inactive: !active, clickable }">
    <span class="item-label">{{ label }}</span>
    <span class="item-indicator" :class="{ empty: percentage === 0 }" :style="cssProps" />
  </div>
</template>

<script lang="ts" setup>
import { computed, StyleValue } from 'vue';

import { colorScale } from '@utils/color-utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ label: string; active?: boolean; percentage?: number; clickable?: boolean }>();
const fullPercentageColor = '#6bd184';
const lowPercentageColor = '#dd655a';

const cssProps = computed(() => {
  return {
    '--indicator-color': calcPercentageColor(props.percentage),
    '--indicator-width': `${props.percentage}%`,
  } as StyleValue;
});

function calcPercentageColor(percentage: number | undefined): string {
  if (!percentage) {
    return '';
  }
  return colorScale(fullPercentageColor, lowPercentageColor, percentage / 100);
}
</script>

<style lang="scss" scoped>
@import './ItemBlock';
</style>
