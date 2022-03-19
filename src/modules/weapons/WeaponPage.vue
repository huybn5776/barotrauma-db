<template>
  <div class="weapon-page">
    <div class="weapon-rows-container">
      <div class="weapon-row">
        <span class="weapon-row-header">Image</span>
        <div class="weapon-info weapon-row-header">
          <span>Info & </span>
          <span>Effect/DPS</span>
        </div>
      </div>

      <div v-for="weapon of weaponsViewData" class="weapon-row">
        <a
          class="weapon-image-and-name"
          :href="`https://barotraumagame.com/baro-wiki/index.php?search=${weapon.item.englishName || weapon.item.name}`"
        >
          <ItemImage :item="weapon.item" :size="64" />
          <span class="weapon-name">{{ weapon.item.name }}</span>
        </a>
        <div class="weapon-info">
          <MeleeWeaponView v-if="weapon.melee" :melee="weapon.melee" />
          <RangedWeaponView v-if="weapon.ranged" :ranged="weapon.ranged" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, provide } from 'vue';

import { provideLocaleTextKey } from '@symbols';
import { indexBy } from 'ramda';

import ItemImage from '@components/ItemImage/ItemImage.vue';
import { useMitt } from '@compositions/use-mitt';
import { SettingKey } from '@enums/setting-key';
import { Locale } from '@interfaces/locale';
import { WeaponViewData } from '@interfaces/weapon-view-data';
import { useProvideLocaleFile } from '@modules/items/compositions/use-provide-locale-file';
import MeleeWeaponView from '@modules/weapons/components/MeleeWeaponView/MeleeWeaponView.vue';
import RangedWeaponView from '@modules/weapons/components/RangedWeaponView/RangedWeaponView.vue';
import { DataConvertContext } from '@services/data-convert-service';
import { getAllItemsAndLocale } from '@services/data-source-service';
import { filterWeaponItems, itemsToWeaponsView, filterEffectiveWeapons } from '@services/weapon-data-conver-service';
import { getSettingFromStorage } from '@utils/storage-utils';

const { onEvent } = useMitt();
useProvideLocaleFile();

const weaponsViewData = ref<WeaponViewData[]>([]);
const quickFilter = ref('');

onMounted(async () => {
  weaponsViewData.value = await getWeaponsViewData();
  onEvent('locale-updated', async () => (weaponsViewData.value = await getWeaponsViewData()));
});

const localeText = ref<Locale>();
provide(provideLocaleTextKey, localeText);

async function getWeaponsViewData(): Promise<WeaponViewData[]> {
  const preferredLocale = (await getSettingFromStorage(SettingKey.PreferredLocale)) || 'english';
  const { items, locale } = await getAllItemsAndLocale(preferredLocale);
  localeText.value = locale;

  const weaponItems = filterWeaponItems(items);
  const itemsMap = indexBy((item) => item.identifier, items);
  const context: DataConvertContext = { itemsMap, items, locale };
  const viewDataArray = itemsToWeaponsView(weaponItems, context);
  return filterEffectiveWeapons(viewDataArray);
}
</script>

<style lang="scss" scoped>
@import './WeaponPage';
</style>
