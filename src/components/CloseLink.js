// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import CloseIcon from './icons/actions/Close';
import { getQueryParams } from '../lib/queryParams';
import { t } from 'c-3po';

type ClickHandler = (el: HTMLElement, ev: MouseEvent) => void;
type FocusHandler = (el: HTMLElement, ev: MouseEvent) => void;
type BlurHandler = (el: HTMLElement, ev: MouseEvent) => void;

type Props = {
  className: string,
  onClick: ClickHandler,
  onFocus: FocusHandler,
  onBlur: BlurHandler,
}

class CloseLink extends React.Component<Props> {

  onClick = event => {
    if (this.props.onClick) {
      this.props.onClick(event);
      return;
    }
    event.preventDefault();
    const params = getQueryParams();
    this.props.history.push(`/beta#?${queryString.stringify(params)}`);
  }

  focus() {
    const linkElement = ReactDOM.findDOMNode(this.linkInstance)
    linkElement.focus();
  }

  render() {
    return(
      <Link
        to="/beta/"
        ref={linkInstance => this.linkInstance = linkInstance}
        className={this.props.className}
        onBlur={this.props.onBlur}
        onFocus={this.props.onFocus}
        onClick={this.onClick}
        role='button'
        aria-label={t`Clear Search`}
      >
        <CloseIcon />
      </Link>
    )
  }
}

const StyledCloseLink = styled(CloseLink)`
  display: inline-block;
  position: sticky;
  float: right;
  padding: 16px;
  font-size: 30px;
  color: rgba(0, 0, 0, 0.3);
  background-color: rgba(251, 250, 249, 0.8);
  border: 1px rgba(0, 0, 0, 0.01) solid;
  border-radius: 31px;
  text-decoration: none;
  text-align: center;
  z-index: 1;
  transform: translateZ(0);

  > svg {
    display: block;
  }
`;

export default StyledCloseLink;
