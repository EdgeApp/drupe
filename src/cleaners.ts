import {
  asArray,
  asBoolean,
  asEither,
  asNull,
  asNumber,
  asObject,
  asOptional,
  asString,
  asTuple,
  asValue,
  type Cleaner,
} from "cleaners";
import type {
  MangoFieldMatcher,
  MangoFieldSelector,
  MangoKeyMapMatch,
  MangoPrimitive,
  MangoSelector,
  MangoType,
  MangoValue,
} from "./types";
import { locateError } from "./util/locateError";

export const asMangoSelector: Cleaner<MangoSelector> = (
  raw: unknown,
): MangoSelector => {
  if (typeof raw !== "object" || raw == null || Array.isArray(raw)) {
    throw new TypeError("Expected a Mango selector object");
  }

  const source = raw as Record<string, unknown>;
  const result: MangoSelector = {};

  for (const key of Object.keys(source)) {
    try {
      if (key === "__proto__") continue;
      const value = source[key];

      if (value === undefined) {
        result[key] = undefined;
        continue;
      }

      if (key === "$and" || key === "$or" || key === "$nor") {
        result[key] = asMangoSelectorArray(value);
        continue;
      }

      if (key === "$not") {
        result[key] = asMangoSelector(value);
        continue;
      }

      result[key] = asEither(asMangoFieldSelector, asMangoSelectorArray)(value);
    } catch (error) {
      throw locateError(error, "." + key, 0);
    }
  }

  return result;
};

const asMangoSelectorArray: Cleaner<MangoSelector[]> = asArray(asMangoSelector);

const asMangoPrimitive: Cleaner<MangoPrimitive> = asEither(
  asNull,
  asBoolean,
  asNumber,
  asString,
);

const asMangoValue: Cleaner<MangoValue> = asEither(
  asMangoPrimitive,
  asArray((raw: unknown) => asMangoValue(raw)),
  asObject((raw: unknown) => asMangoValue(raw)),
);

const asMangoValueArray: Cleaner<MangoValue[]> = asArray(asMangoValue);
const asMangoType: Cleaner<MangoType> = asValue(
  "null",
  "boolean",
  "number",
  "string",
  "array",
  "object",
);

const asMangoKeyMapMatch: Cleaner<MangoKeyMapMatch> = asObject(
  (raw: unknown) => (raw === undefined ? undefined : asMangoSelector(raw)),
);

// Basic primitive cleaners
const asNumberPair = asTuple(asNumber, asNumber);
const asRegex = asEither(asString, asArray(asString));

const asMangoFieldMatcher: Cleaner<MangoFieldMatcher> = asObject({
  $eq: asOptional(asMangoValue),
  $ne: asOptional(asEither(asMangoValue, asMangoValueArray)),
  $gt: asOptional(asMangoValue),
  $gte: asOptional(asMangoValue),
  $lt: asOptional(asMangoValue),
  $lte: asOptional(asMangoValue),
  $exists: asOptional(asBoolean),
  $type: asOptional(asMangoType),
  $in: asOptional(asMangoValueArray),
  $nin: asOptional(asMangoValueArray),
  $size: asOptional(asNumber),
  $mod: asOptional(asNumberPair),
  $regex: asOptional(asRegex),
  $options: asOptional(asString),
  $all: asOptional(asMangoValueArray),
  $elemMatch: asOptional(asMangoSelector),
  $allMatch: asOptional(asMangoSelector),
  $keyMapMatch: asOptional(asMangoKeyMapMatch),
  $not: asOptional((raw: unknown) => asMangoFieldSelector(raw)),
});

const asMangoFieldSelector: Cleaner<MangoFieldSelector> = asEither(
  asMangoValue,
  asMangoFieldMatcher,
  asMangoSelector,
);
