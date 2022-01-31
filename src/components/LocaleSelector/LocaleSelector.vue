<template>
  <div class="locale-selector" ref="selectorRef">
    <button class="locale-selector-button" type="button" @click="expanded = !expanded">
      <i class="web-icon" />
      <i class="chevron-down-icon" />
    </button>
    <div class="locale-selector-dropdown" :class="{ 'locale-selector-dropdown-collapsed': !expanded }">
      <button
        v-for="{ key, name } of locales"
        :key="key"
        class="locale-dropdown-item"
        type="button"
        @click="updateLocale(key)"
      >
        {{ name }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import { useClickOutside } from '@compositions/use-click-outside';
import { SettingKey } from '@enums/setting-key';
import { LocaleSelection } from '@interfaces/locale-selection';
import { getLocales } from '@services/data-source-service';
import { saveSettingToStorage } from '@utils/storage-utils';

const locales = ref<LocaleSelection[]>([]);
const expanded = ref(false);
const selectorRef = ref<HTMLElement>();

useClickOutside({ element: selectorRef, whenToListen: expanded, clickOutsideCallback: () => (expanded.value = false) });

onMounted(async () => (locales.value = await getLocales()));

function updateLocale(localeKey: string): void {
  saveSettingToStorage(SettingKey.PreferredLocale, localeKey);
  expanded.value = false;
}
</script>

<style lang="scss" scoped>
@import './LocaleSelector';
</style>
