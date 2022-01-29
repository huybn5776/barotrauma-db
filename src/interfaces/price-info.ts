import { LocationPriceInfo } from '@interfaces/location-price-info';

export interface PriceInfo {
  basePrice: number;
  canBeBought?: boolean;
  soldEverywhere?: boolean;
  canBeSpecial?: boolean;
  minLevelDifficulty?: number;
  locations?: LocationPriceInfo[];
}
