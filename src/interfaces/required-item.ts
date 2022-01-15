export interface RequiredItem {
  identifier: string;
  amount: number;
  useCondition?: boolean;
  minCondition?: number;
  maxCondition?: number;
}
