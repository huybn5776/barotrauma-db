<template>
  <ItemBlock
    label="Items"
    :active="!!convertResult.items?.length"
    :clickable="!!convertResult.items?.length"
    @click="downloadItems"
  />
  <ItemBlock
    label="Texts"
    :active="!!convertResult.texts?.length"
    :clickable="!!convertResult.texts?.length"
    @click="downloadTexts"
  />
  <div v-if="convertResult.items?.length || convertResult.texts?.length" class="items-description">
    <p>{{ convertResult.items?.length || 0 }} Items</p>
    <p>{{ convertResult.texts?.length || 0 }} Locales</p>
  </div>

  <template v-if="convertResult.items?.length && convertResult.texts?.length">
    <p class="items-with-description">Items with locale</p>
    <ItemBlock
      v-for="locale of convertResult.texts"
      :key="locale.language"
      clickable
      active
      :label="locale.name"
      @click="downloadItemWithText(locale)"
    />
  </template>
</template>

<script lang="ts" setup>
import { strToU8, zipSync, ZipOptions, Zippable, ZippableFile } from 'fflate';

import ItemBlock from '@components/ItemBlock/ItemBlock.vue';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { mergeItemsName } from '@services/game-data-parser';
import { saveDataToJsonFile, downloadFile } from '@utils/file-utils';

const props = defineProps<{ convertResult: { items?: ItemPrefab[]; texts?: Locale[] } }>();

function downloadItems(): void {
  if (!props.convertResult.items) {
    return;
  }
  saveDataToJsonFile(props.convertResult.items, { fileName: 'items', space: 2 });
}

function downloadTexts(): void {
  if (!props.convertResult.texts?.length) {
    return;
  }
  const filesToArchive: Record<string, Uint8Array> = {};
  props.convertResult.texts.forEach((locale) => {
    const json = JSON.stringify(locale, null, 2);
    const fileName = `${locale.language.replace(' ', '-').toLocaleLowerCase()}.json`;
    filesToArchive[fileName] = strToU8(json);
  });
  archiveFilesAndDownload('texts', filesToArchive);
}

function archiveFilesAndDownload(
  fileName: string,
  files: Record<string, Zippable | ZippableFile>,
  options?: ZipOptions,
): void {
  const zipped = zipSync(files, options);
  const zipBlob = new Blob([zipped], { type: 'application/zip' });
  const url = URL.createObjectURL(zipBlob);
  downloadFile(url, `${fileName}.zip`);
}

function downloadItemWithText(targetLocale: Locale): void {
  const { items, texts } = props.convertResult || {};
  if (!items?.length || !texts?.length) {
    return;
  }
  const itemsWithText = mergeItemsName(items, texts, targetLocale);
  const fileName = `items_${targetLocale.language.replace(' ', '_').toLocaleLowerCase()}`;
  saveDataToJsonFile(itemsWithText, { fileName, space: 2 });
}
</script>

<style lang="scss" scoped>
@import './DataImportOutput';
</style>
