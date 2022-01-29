<template>
  <a href="https://barotraumagame.com/wiki/Campaign#Habitation_Outpost" target="_blank">
    <img
      v-if="type === LocationType.Outpost"
      class="location-image"
      src="/src/assets/icon/location-habitation-outpost.png"
      alt="Habitation"
    />
  </a>
  <a href="https://barotraumagame.com/wiki/Campaign#Colony" target="_blank">
    <img
      v-if="type === LocationType.City"
      class="location-image"
      src="/src/assets/icon/location-colony.png"
      alt="Colony"
    />
  </a>
  <a href="https://barotraumagame.com/wiki/Campaign#Research_Outpost" target="_blank">
    <img
      v-if="type === LocationType.Research"
      class="location-image"
      src="/src/assets/icon/location-research-outpost.png"
      alt="Research"
    />
  </a>
  <a href="https://barotraumagame.com/wiki/Campaign#Military_Outpost" target="_blank">
    <img
      v-if="type === LocationType.Military"
      class="location-image"
      src="/src/assets/icon/location-military-outpost.png"
      alt="Military"
    />
  </a>
  <a href="https://barotraumagame.com/wiki/Campaign#Mining_Outpost" target="_blank">
    <img
      v-if="type === LocationType.Mine"
      class="location-image"
      src="/src/assets/icon/location-mining-outpost.png"
      alt="Mining"
    />
  </a>
</template>

<script lang="ts" setup>
import { LocationType } from '@enums/location-type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ type: LocationType }>();
</script>

<style lang="scss" scoped>
@import './LocationIcon';
</style>
