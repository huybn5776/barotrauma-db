export enum SettingKey {
  PreferredLocale = 'preferredLocale',
  ShowCollectibleImage = 'showCollectibleImage',
  ShowPriceDetail = 'showPriceDetail',
}

export type SettingValueType = {
  [SettingKey.PreferredLocale]: string;
} & ColumnSettings;

export type ColumnSettings = {
  [SettingKey.ShowCollectibleImage]: boolean;
  [SettingKey.ShowPriceDetail]: boolean;
};
