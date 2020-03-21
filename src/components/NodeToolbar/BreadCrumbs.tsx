import compact from 'lodash/compact';
import * as React from 'react';
import styled from 'styled-components';
import { getCategory } from '../../lib/api/model/Categories';
import { categoryNameFor } from '../../lib/model/Categories';
import {
  Category,
  CategoryLookupTables,
  getCategoryId,
} from '../../lib/types/Categories';
import {
  AccessibilityCloudProperties,
  WheelmapProperties,
} from '../../lib/types/Feature';
import ChevronRight from '../ChevronRight';

type Props = {
  className?: string;
  category: Category | null;
  categories: CategoryLookupTables;
  parentCategory: Category | null;
  properties: WheelmapProperties | AccessibilityCloudProperties;
};

type State = {
  displayedCategoryNames: string[];
};

class BreadCrumbs extends React.Component<Props, State> {
  state = {
    displayedCategoryNames: [],
  };

  constructor(props: Props) {
    super(props);
    this.state.displayedCategoryNames = this.getCategoryNames(props);
  }

  UNSAFE_componentWillMount() {
    this.setState({
      displayedCategoryNames: this.getCategoryNames(this.props),
    });
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    this.setState({ displayedCategoryNames: this.getCategoryNames(props) });
  }

  categoryIds(props) {
    const categoryId = props.category && getCategoryId(props.category);
    return [categoryId];
  }

  getCategoryNames(props: Props) {
    return compact(
      this.categoryIds(props).map(id => {
        return categoryNameFor(getCategory(props.categories, id));
      }),
    );
  }

  render() {
    const breadCrumbs = this.state.displayedCategoryNames.map((s, i) => (
      <span className="breadcrumb" key={i}>
        {s}
        <ChevronRight key={`c${i}`} />
      </span>
    ));

    return <section className={this.props.className}>{breadCrumbs}</section>;
  }
}

const StyledBreadCrumbs = styled(BreadCrumbs)`
  color: rgba(0, 0, 0, 0.6);

  display: inline-block;
  &,
  .breadcrumb {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .breadcrumb:last-child .chevron-right {
    display: none;
  }
`;

export default StyledBreadCrumbs;
