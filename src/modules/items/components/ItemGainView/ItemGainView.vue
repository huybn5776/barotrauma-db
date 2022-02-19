<template>
  <div class="gain-item-container">
    <span>Gain item: {{ item?.item?.name }}</span>
    <span v-if="soldInLocations.length">&ensp;Sold in</span>

    <template v-for="soldInLocation of soldInLocations" :key="soldInLocation.location">
      <LocationIcon :type="soldInLocation.location" />
      <span>(${{ soldInLocation.price }})</span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import LocationIcon from '@components/LocationIcon/LocationIcon.vue';
import { ItemViewData } from '@interfaces/item-view-data';

const props = defineProps<{ item: ItemViewData }>();

const soldInLocations = computed(() => {
  const { soldPrices } = props.item;
  return soldPrices.filter((price) => price.buy).map(({ location, buy }) => ({ location, price: buy }));
});
</script>

<style lang="scss" scoped>
@import './ItemGainView';
</style>
