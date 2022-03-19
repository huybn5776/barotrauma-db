import { ConditionOperator } from '@enums/condition-operator';

export type Conditional = {
  operator?: ConditionOperator;
  entityType?: string;
  condition?: number;
  mass?: number;
} & { [key: string]: string | number | boolean };
