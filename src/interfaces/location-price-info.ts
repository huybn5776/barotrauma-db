import { LocationType } from '@enums/location-type';

export interface LocationPriceInfo {
  locationType: LocationType;
  multiplier?: number;
  minAvailable?: number;
  maxAvailable?: number;
  sold?: boolean;
}
