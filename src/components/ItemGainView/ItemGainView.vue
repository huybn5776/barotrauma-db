<template>
  <div class="gain-item-container">
    <span>Gain item: {{ item?.item?.name }}</span>
    <span>&ensp;Sold in</span>

    <template v-for="soldInLocation of soldInLocations" :key="soldInLocation.location">
      <LocationIcon :type="soldInLocation.location" />
      <span>(${{ soldInLocation.price }})</span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import LocationIcon from '@components/LocationIcon/LocationIcon.vue';
import { LocationType } from '@enums/location-type';
import { ItemViewData } from '@interfaces/item-view-data';

const allLocationTypes = [
  LocationType.Outpost,
  LocationType.City,
  LocationType.Research,
  LocationType.Military,
  LocationType.Mine,
];

const props = defineProps<{ item: ItemViewData }>();

const soldInLocations = computed(() => {
  const { soldPrices } = props.item;
  return allLocationTypes
    .map((location) => ({ location, price: Math.floor(soldPrices?.[location] || 0) }))
    .filter(({ price }) => price);
});
</script>

<style lang="scss" scoped>
@import './ItemGainView';
</style>
