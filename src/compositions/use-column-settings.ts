import { ref, Ref } from 'vue';

import { ColumnSettings, SettingKey } from '@enums/setting-key';
import { getSettingFromStorage } from '@utils/storage-utils';

export function useColumnSettings(): Ref<ColumnSettings> {
  const columnSettings = ref<ColumnSettings>({
    [SettingKey.ShowCollectibleImage]: getSettingFromStorage(SettingKey.ShowCollectibleImage) || false,
  });
  return columnSettings;
}
