import HamsterCache from '@sozialhelden/hamster-cache';
import { ClassicCategory } from '../../../model/Categories';
import getClassicCategories from './getClassicCategories';
import getClassicNodeTypes from './getClassicNodeTypes';

export type WheelmapRawCategoryLists = {
  wheelmapCategories: ClassicCategory[];
};

export type CategoryLookupTables = {
  idsToWheelmapCategories: { [idx: number]: ClassicCategory };
  classicCategoryNamesToCategories: { [key: string]: ClassicCategory };
  classicRootCategoryNamesToCategories: { [key: string]: ClassicCategory };
};

const rawCategoryListsCache = new HamsterCache<
  string,
  Promise<WheelmapRawCategoryLists>
>();

export function generateLookupTable() {
  const lookupTable: CategoryLookupTables = {
    idsToWheelmapCategories: {},
    classicCategoryNamesToCategories: {},
    classicRootCategoryNamesToCategories: {},
  };
  fillClassicCategoryLookupTable(lookupTable, getClassicCategories());
  fillClassicCategoryLookupTable(lookupTable, getClassicNodeTypes());
  return lookupTable;
}

export function fillClassicCategoryLookupTable(
  lookupTable: CategoryLookupTables,
  categories: ClassicCategory[],
) {
  categories.forEach(category => {
    lookupTable.idsToWheelmapCategories[category.id] = category;
    lookupTable.classicCategoryNamesToCategories[
      category.identifier
    ] = category;
    if (!category.category_id) {
      lookupTable.classicRootCategoryNamesToCategories[
        category.identifier
      ] = category;
    }
  });
}

export function classicCategoryWithName(
  lookupTable: CategoryLookupTables,
  name: string,
) {
  return lookupTable.classicCategoryNamesToCategories[name];
}

export function classicRootCategoryWithName(
  lookupTable: CategoryLookupTables,
  name: string,
) {
  return lookupTable.classicRootCategoryNamesToCategories[name];
}
