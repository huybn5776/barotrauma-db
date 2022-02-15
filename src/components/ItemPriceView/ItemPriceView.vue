<template>
  <div class="item-price-view">
    <p v-if="basePrice && (!detail || !viewData.soldPrices.length)" class="item-base-price">${{ basePrice }}</p>

    <div v-if="detail" class="detail-price-view">
      <span v-if="viewData.item.price?.minLevelDifficulty" class="sold-min-difficulty">
        Sold after difficulty {{ viewData.item.price?.minLevelDifficulty }}%
      </span>
      <div class="location-price-rows">
        <div v-for="price of viewData.soldPrices" :key="price.location" class="location-price-row">
          <LocationIcon class="price-view-location-icon" :type="price.location" />
          <span v-if="price.buy" class="location-price location-buy">${{ price.buy }}</span>
          <span v-if="price.sell" class="location-price location-sell">${{ price.sell }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import LocationIcon from '@components/LocationIcon/LocationIcon.vue';
import { ItemViewData } from '@interfaces/item-view-data';

const props = defineProps<{ viewData: ItemViewData; detail?: boolean }>();
const basePrice = computed(() => props.viewData.item.price?.basePrice);
</script>

<style lang="scss" scoped>
@import './ItemPriceView';
</style>
