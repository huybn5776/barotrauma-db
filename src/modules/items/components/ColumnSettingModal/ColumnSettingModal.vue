<template>
  <TopBarDropdown buttonClass="setting-button">
    <button class="column-setting-toggle-button" type="button" @click="toggleShowCollectibleImage">
      <span>Show ore/plant collectable state image in Name column</span>
      <NSwitch :value="showCollectibleImage" />
    </button>
    <button class="column-setting-toggle-button" type="button" @click="togglePriceDetail">
      <span>Show price detail</span>
      <NSwitch :value="priceDetail" />
    </button>
    <button class="column-setting-toggle-button" type="button" @click="toggleItemDescription">
      <span>Show item description</span>
      <NSwitch :value="itemDescription" />
    </button>
  </TopBarDropdown>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

import { NSwitch } from 'naive-ui';

import { ColumnSettings, SettingKey } from '@enums/setting-key';
import TopBarDropdown from '@modules/items/components/TopBarDropdown/TopBarDropdown.vue';

const props = defineProps<{ modelValue: ColumnSettings }>();
const emits = defineEmits<{ (e: 'update:modelValue', value: ColumnSettings): void }>();

const showCollectibleImage = ref(props.modelValue?.showCollectibleImage || false);
const priceDetail = ref(props.modelValue?.showPriceDetail || false);
const itemDescription = ref(props.modelValue?.showItemDescription || false);

function toggleShowCollectibleImage(): void {
  showCollectibleImage.value = !showCollectibleImage.value;
  emitUpdate();
}

function togglePriceDetail(): void {
  priceDetail.value = !priceDetail.value;
  emitUpdate();
}

function toggleItemDescription(): void {
  itemDescription.value = !itemDescription.value;
  emitUpdate();
}

function emitUpdate(): void {
  emits('update:modelValue', {
    [SettingKey.ShowCollectibleImage]: showCollectibleImage.value,
    [SettingKey.ShowPriceDetail]: priceDetail.value,
    [SettingKey.ShowItemDescription]: itemDescription.value,
  });
}

watchEffect(() => {
  showCollectibleImage.value = props.modelValue.showCollectibleImage;
  priceDetail.value = props.modelValue.showPriceDetail;
  itemDescription.value = props.modelValue.showItemDescription;
});
</script>

<style lang="scss" scoped>
@import './ColumnSettingDropdown';
</style>
