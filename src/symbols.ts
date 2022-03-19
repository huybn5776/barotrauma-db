import { InjectionKey, Ref } from 'vue';

import { Locale } from '@interfaces/locale';

export const provideGetLocaleFileKey: InjectionKey<(path: string) => Promise<string | null>> =
  Symbol('provideGetLocaleFileKey');
export const provideLocaleTextKey: InjectionKey<Ref<Locale | undefined>> = Symbol('localeTextProvider');
