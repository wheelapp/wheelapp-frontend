import { ACCategory } from '../../../model/Categories';
import getClassicNodeTypes from './getClassicNodeTypes';
import { getCategory, SynonymToCategoryMap } from './SynonymToCategoryMap';

export type ClassicNodeTypesToACCategories = {
  [key: string]: ACCategory;
};

export function generateLookupTable(
  synonymToCategoryMap: SynonymToCategoryMap,
): ClassicNodeTypesToACCategories {
  const table: ClassicNodeTypesToACCategories = {};
  getClassicNodeTypes().forEach(nodeType => {
    table[nodeType.identifier] = getCategory(
      synonymToCategoryMap,
      nodeType.identifier,
    );
  });
  return table;
}
