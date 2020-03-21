import { t } from 'ttag';
import { LocalizedString, translatedStringFromObject } from '../../i18n';
import {
  AccessibilityCloudProperties,
  ClassicCategoryOrNodeType,
  hasAccessibleToilet,
  isWheelmapProperties,
  NodeProperties,
  WheelmapProperties,
} from './Feature';

export interface ACCategory {
  _id: string;
  translations: {
    _id: LocalizedString;
  };
  synonyms: string[];
  icon: string;
  parentIds: string[];
}

export interface ClassicNodeType {
  id: number;
  identifier: string;
  category_id: number;
  category: {
    id: number;
    identifier: string;
  };
  localized_name: string;
  icon: string;
}

export interface ClassicCategory {
  id: number;
  identifier: string;
  localized_name: string;
}

export type Category = ClassicCategory | ACCategory | ClassicNodeType;

export type RootCategoryEntry = {
  name: string;
  isSubCategory?: boolean;
  isMetaCategory?: boolean;
  filter?: (properties: NodeProperties | undefined) => boolean;
};

// This must be a function - Results from t`` are dependent on the current context.
// If t`` is called at root level of a module, it doesn't know the translations yet
// as they are loaded later, at runtime.
// Using it inside a function while rendering ensures the runtime-loaded translations
// are correctly returned.
const getRootCategoryTable = (): { [key: string]: RootCategoryEntry } => ({
  shopping: {
    // translator: Root category
    name: t`Shopping`,
  },
  food: {
    // translator: Root category
    name: t`Food & Drinks`,
  },
  public_transfer: {
    // translator: Root category
    name: t`Transport`,
  },
  leisure: {
    // translator: Root category
    name: t`Leisure`,
  },
  accommodation: {
    // translator: Root category
    name: t`Hotels`,
  },
  tourism: {
    // translator: Root category
    name: t`Tourism`,
  },
  education: {
    // translator: Root category
    name: t`Education`,
  },
  government: {
    // translator: Root category
    name: t`Authorities`,
  },
  health: {
    // translator: Root category
    name: t`Health`,
  },
  money_post: {
    // translator: Root category
    name: t`Money`,
  },
  sport: {
    // translator: Root category
    name: t`Sports`,
  },
  toilets: {
    // translator: Meta category for any toilet or any place with an accessible toilet
    name: t`Toilets`,
    isMetaCategory: true,
    isSubCategory: true,
    filter: (properties: NodeProperties | undefined) => {
      if (!properties) {
        return true;
      }

      return hasAccessibleToilet(properties, true) === 'yes';
    },
  },
});

export function getRootCategories() {
  return getRootCategoryTable();
}

export function getRootCategory(key: string) {
  return getRootCategoryTable()[key];
}

export function translatedRootCategoryName(key: string) {
  return getRootCategoryTable()[key].name;
}

export function categoryNameFor(category: ACCategory): string | void {
  return translatedStringFromObject(category.translations?._id);
}

export function getCategoryId(
  category?: Category | string | ClassicCategoryOrNodeType | undefined,
): string | undefined {
  if (!category) {
    return;
  }
  // ac
  if (typeof category === 'string') {
    return category;
  }

  if (typeof category === 'object' && category) {
    // wheelmap node_type or category
    if (typeof category['identifier'] === 'string') {
      return category['identifier'];
    }
    // ac server category object
    if (typeof category['_id'] === 'string') {
      return category['_id'];
    }
  }
}

export function getCategoryIdFromProperties(
  props: AccessibilityCloudProperties | WheelmapProperties,
): string | undefined {
  if (!props) {
    return;
  }

  if (
    isWheelmapProperties(props) &&
    props.node_type &&
    typeof props.node_type.identifier === 'string'
  ) {
    return getCategoryId(props.node_type.identifier);
  }

  return getCategoryId(props.category);
}
