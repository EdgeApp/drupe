export type Drupe = (selector: MangoSelector) => DrupeQuery;
export type DrupeQuery = (subject: unknown) => boolean;

export type MangoPrimitive = null | boolean | number | string;

export type MangoValue =
  | MangoPrimitive
  | MangoValue[]
  | { [key: string]: MangoValue };

export type MangoDocument = { [field: string]: MangoValue };

export type MangoType =
  | 'null'
  | 'boolean'
  | 'number'
  | 'string'
  | 'array'
  | 'object';

export interface MangoKeyMapMatch {
  [key: string]: MangoSelector | undefined;
  $default?: MangoSelector;
}

export interface MangoFieldMatcher {
  $eq?: MangoValue;
  $ne?: MangoValue | MangoValue[];
  $gt?: MangoValue;
  $gte?: MangoValue;
  $lt?: MangoValue;
  $lte?: MangoValue;
  $exists?: boolean;
  $type?: MangoType;
  $in?: MangoValue[];
  $nin?: MangoValue[];
  $size?: number;
  $mod?: [number, number];
  $regex?: string | string[];
  $options?: string;
  $all?: MangoValue[];
  $elemMatch?: MangoSelector;
  $allMatch?: MangoSelector;
  $keyMapMatch?: MangoKeyMapMatch;
  $not?: MangoFieldSelector;
}

export type MangoFieldSelector =
  | MangoValue
  | MangoFieldMatcher
  | MangoSelector
  | (MangoFieldMatcher & MangoSelector);

export interface MangoSelector {
  [field: string]:
    | MangoFieldSelector
    | MangoSelector[]
    | MangoSelector
    | undefined;
  $and?: MangoSelector[];
  $or?: MangoSelector[];
  $nor?: MangoSelector[];
  $not?: MangoSelector;
}

