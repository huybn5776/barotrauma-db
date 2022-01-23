import { inject, provide, ref, Ref } from 'vue';

import { SettingKey } from '@enums/setting-key';
import { Locale } from '@interfaces/locale';
import { getSettingFromStorage } from '@utils/storage-utils';

const provideProvideLocale = 'provideLocale';

export async function useProvideLocale(): Promise<Locale> {
  const locale = ref<Locale>();
  provide(provideProvideLocale, locale);

  const preferredLocale = getSettingFromStorage(SettingKey.PreferredLocale) || 'traditional-chinese';
  const targetLocale: Locale = await (await fetch(`/data-source/texts/${preferredLocale}.json`)).json();
  locale.value = targetLocale;
  return targetLocale;
}

export function injectLocale(): Ref<Locale> | undefined {
  return inject<Ref<Locale>>(provideProvideLocale);
}
