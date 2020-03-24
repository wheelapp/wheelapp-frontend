import * as React from 'react';
import { t } from 'ttag';
import { SearchResultFeature } from '../../lib/context/api/searchPlaces';
import { getCategoriesForFeature } from '../../lib/context/caches/categories/SynonymToCategoryMap';
import { Category, getCategoryId } from '../../lib/model/Categories';
import { isWheelchairAccessible, WheelmapFeature } from '../../lib/model/Feature';
import getAddressString from '../../lib/model/getAddressString';
import Icon from '../Icon';
import Address from '../NodeToolbar/Address';
import PlaceName from '../PlaceName';

type Props = {
  feature: SearchResultFeature;
  categories: CategoryLookupTables;
  onClick: (
    feature: SearchResultFeature,
    wheelmapFeature?: WheelmapFeature,
  ) => void;
  hidden: boolean;
  wheelmapFeature?: WheelmapFeature;
};

type State = {
  category?: Category;
  parentCategory?: Category;
  wheelmapFeature?: WheelmapFeature;
};

export default class SearchResult extends React.Component<Props, State> {
  props: Props;

  state: State = {
    category: null,
    parentCategory: null,
    wheelmapFeature: null,
  };

  root = React.createRef<HTMLLIElement>();

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> {
    const { categories, feature, wheelmapFeature } = props;

    const classicCategoryData = getCategoriesForFeature(categories, feature);
    return {
      wheelmapFeature: wheelmapFeature,
      ...classicCategoryData,
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { wheelmapFeature } = this.state;

    if (wheelmapFeature && prevState.wheelmapFeature !== wheelmapFeature) {
      this.handleWheelmapFeatureFetched(wheelmapFeature, wheelmapFeature),
    }
  }

  handleWheelmapFeatureFetched = (
    prevWheelmapFeature: WheelmapFeature,
    wheelmapFeature?: WheelmapFeature,
  ) => {
    if (this.state.wheelmapFeature !== prevWheelmapFeature) {
      return;
    }

    const { categories, feature } = this.props;
    const classicCategoryData = getCategoriesForFeature(
      categories,
      wheelmapFeature || feature,
    );
    this.setState({
      wheelmapFeature,
      category: classicCategoryData.category || this.state.category,
      parentCategory:
        classicCategoryData.parentCategory || this.state.parentCategory,
    });
  };

  focus() {
    this.root.current?.focus();
  }

  render() {
    const { feature } = this.props;
    const { wheelmapFeature, category, parentCategory } = this.state;
    const properties = feature && feature.properties;
    // translator: Place name shown in search results for places with unknown name / category.
    const placeName = properties ? properties.name : t`Unnamed`;
    const address =
      properties &&
      getAddressString({
        country: properties.country,
        street: properties.street,
        housenumber: properties.housenumber,
        postcode: properties.postcode,
        city: properties.city,
      });

    const shownCategory = category || parentCategory;
    const shownCategoryId = shownCategory && getCategoryId(shownCategory);

    const wheelmapFeatureProperties = wheelmapFeature
      ? wheelmapFeature.properties
      : null;
    const accessibility =
      wheelmapFeatureProperties &&
      isWheelchairAccessible(wheelmapFeatureProperties);

    return (
      <li
        ref={this.root}
        className={`osm-category-${feature.properties.osm_key ||
          'unknown'}-${feature.properties.osm_value || 'unknown'}`}
      >
        <button
          onClick={() => {
            this.props.onClick(feature, wheelmapFeature);
          }}
          className="link-button"
          tabIndex={this.props.hidden ? -1 : 0}
        >
          <PlaceName>
            {shownCategoryId ? (
              <Icon
                accessibility={accessibility || null}
                category={shownCategoryId}
                size="medium"
                centered
                ariaHidden={true}
              />
            ) : null}
            {placeName}
          </PlaceName>
          {address ? <Address role="none">{address}</Address> : null}
        </button>
      </li>
    );
  }
}
