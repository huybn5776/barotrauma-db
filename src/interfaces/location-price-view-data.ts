import { LocationType } from '@enums/location-type';

export interface LocationPriceViewData {
  location: LocationType;
  buy: number;
  sell: number;
}
