export enum SettingKey {
  PreferredLocale = 'preferredLocale',
  ShowCollectibleImage = 'showCollectibleImage',
  ShowPriceDetail = 'showPriceDetail',
  ShowItemDescription = 'showItemDescription',
}

export type SettingValueType = {
  [SettingKey.PreferredLocale]: string;
} & ColumnSettings;

export type ColumnSettings = {
  [SettingKey.ShowCollectibleImage]: boolean;
  [SettingKey.ShowPriceDetail]: boolean;
  [SettingKey.ShowItemDescription]: boolean;
};
