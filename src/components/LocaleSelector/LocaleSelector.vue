<template>
  <div class="locale-selector">
    <NDropdown trigger="click" placement="bottom" :options="locales" labelField="name" @select="updateLocale">
      <button class="locale-selector-button" type="button">
        <i class="web-icon" />
        <i class="chevron-down-icon" />
      </button>
    </NDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import { NDropdown } from 'naive-ui';

import { useMitt } from '@compositions/use-mitt';
import { SettingKey } from '@enums/setting-key';
import { LocaleSelection } from '@interfaces/locale-selection';
import { getLocales } from '@services/data-source-service';
import { saveSettingToStorage } from '@utils/storage-utils';

const { emitter } = useMitt();

const locales = ref<LocaleSelection[]>([]);

onMounted(async () => (locales.value = await getLocales()));

function updateLocale(localeKey: string): void {
  saveSettingToStorage(SettingKey.PreferredLocale, localeKey);
  emitter.emit('locale-updated');
}
</script>

<style lang="scss" scoped>
@import './LocaleSelector';
</style>
