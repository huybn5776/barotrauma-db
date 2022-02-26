<template>
  <ItemBlock
    label="Items"
    :active="!!convertResult.items?.length"
    :clickable="!!convertResult.items?.length"
    @click="downloadItems"
  />
  <ItemBlock
    label="Item images"
    :active="!!convertResult.images"
    :clickable="!!convertResult.images"
    @click="downloadImages"
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
    <div class="items-output-actions-container">
      <NSpin :show="savingDataSource">
        <button class="b-button items-output-button" @click="saveDataSourceToDb">Append data source</button>
      </NSpin>
    </div>

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
import { toRaw, ref } from 'vue';

import { strToU8, zipSync, ZipOptions, Zippable, ZippableFile } from 'fflate';
import { NSpin, useMessage } from 'naive-ui';

import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import ItemBlock from '@modules/data-importer/components/ItemBlock/ItemBlock.vue';
import { mergeItemsName } from '@services/game-data-parser';
import { saveFileToDb, saveItemsToDb, saveLocalesToDb } from '@services/locale-data-source-service';
import { saveDataToJsonFile, downloadFile } from '@utils/file-utils';

const props = defineProps<{
  convertResult: {
    items?: ItemPrefab[];
    images?: Record<string, File>;
    texts?: Locale[];
  };
}>();

const message = useMessage();
const savingDataSource = ref(false);

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
    const fileName = `${getLocaleKey(locale)}.json`;
    filesToArchive[fileName] = strToU8(`${json}\n`);
  });

  const locales = props.convertResult.texts.map((locale) => ({ key: getLocaleKey(locale), name: locale.name }));
  filesToArchive['locales.json'] = strToU8(JSON.stringify(locales, null, 2));

  archiveFilesAndDownload('texts', filesToArchive);
}

function getLocaleKey(locale: Locale): string {
  return locale.language.replace(' ', '-').toLocaleLowerCase();
}

async function downloadImages(): Promise<void> {
  if (!props.convertResult.images) {
    return;
  }
  const filesToArchive: Record<string, Zippable | ZippableFile> = {};
  const fileInU8Array = await Promise.all(
    Object.entries(props.convertResult.images).map(async ([path, file]) => ({
      path,
      u8Array: new Uint8Array(await file.arrayBuffer()),
      mtime: new Date(file.lastModified),
    })),
  );
  fileInU8Array.map(({ path, u8Array, mtime }) => (filesToArchive[path] = [u8Array, { mtime }]));
  archiveFilesAndDownload('images', filesToArchive, { level: 0 });
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
  const itemsWithText = mergeItemsName(
    items,
    targetLocale,
    targetLocale.name === 'English' ? undefined : texts.find((locale) => locale.name === 'English'),
  );
  const fileName = `items_${targetLocale.language.replace(' ', '_').toLocaleLowerCase()}`;
  saveDataToJsonFile(itemsWithText, { fileName, space: 2 });
}

async function saveDataSourceToDb(): Promise<void> {
  savingDataSource.value = true;
  if (props.convertResult.items) {
    await saveItemsToDb(props.convertResult.items.map((item) => toRaw(item)));
  }
  if (props.convertResult.texts) {
    await saveLocalesToDb(props.convertResult.texts.map((locale) => toRaw(locale)));
  }
  if (props.convertResult.images) {
    await Promise.all(Object.entries(props.convertResult.images).map(async ([path, file]) => saveFileToDb(path, file)));
  }
  savingDataSource.value = false;
  message.success('Data source saved');
}
</script>

<style lang="scss" scoped>
@import './DataImportOutput';
@import 'src/styles/common';
</style>
