import { ACCategory, Category } from '../../../model/Categories';
import { EquipmentInfo } from '../../../model/EquipmentInfo';
import { Feature } from '../../../model/Feature';
import { SearchResultFeature } from '../../api/searchPlaces';

type SynonymToCategoryMap = {
  [key: string]: ACCategory;
};

export function generateSynonymToCategoryMap(
  fromCategories: ACCategory[],
): SynonymToCategoryMap {
  const result: SynonymToCategoryMap = {};
  fromCategories.forEach(category => {
    result[category._id] = category;
    const synonyms = category.synonyms;
    if (!(synonyms instanceof Array)) return;
    synonyms.forEach(synonym => {
      result[synonym] = category;
    });
  });
  return result;
}

export function getCategory(
  synonymToCategoryMap: SynonymToCategoryMap,
  idOrSynonym: string | number,
): ACCategory {
  if (!synonymToCategoryMap) {
    throw new Error('Empty synonym cache.');
  }

  return synonymToCategoryMap[String(idOrSynonym)];
}

export function getCategoriesForFeature(
  synonymToCategoryMap: SynonymToCategoryMap,
  feature: Feature | EquipmentInfo | SearchResultFeature | null,
): { category: Category | null; parentCategory: Category | null } {
  if (!feature) {
    return { category: null, parentCategory: null };
  }

  const properties = feature.properties;
  if (!properties) {
    return { category: null, parentCategory: null };
  }

  let categoryId = null;

  if (typeof properties['node_type']?.identifier === 'string') {
    // Wheelmap Classic node
    categoryId = properties['node_type'].identifier;
  } else if (properties['category']) {
    // AC feature
    categoryId = properties['category'];
  } else if (properties['osm_key']) {
    // Search result OSM node from komoot
    categoryId = properties['osm_value'] || properties['osm_key'];
  }

  if (!categoryId) {
    return { category: null, parentCategory: null };
  }

  const category = getCategory(synonymToCategoryMap, String(categoryId));
  const parentCategory =
    category && getCategory(synonymToCategoryMap, category.parentIds[0]);

  return { category, parentCategory };
}
