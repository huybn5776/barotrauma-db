export enum SettingKey {
  PreferredLocale = 'preferredLocale',
  ShowCollectibleImage = 'showCollectibleImage',
}

export type SettingValueType = {
  [SettingKey.PreferredLocale]: string;
} & ColumnSettings;

export type ColumnSettings = {
  [SettingKey.ShowCollectibleImage]: boolean;
};
