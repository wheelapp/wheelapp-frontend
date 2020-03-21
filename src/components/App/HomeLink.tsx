import React from 'react';
import { t } from 'ttag';
import styled from 'styled-components';

type Props = {
  className?: string,
  logoURL: string,
  href: string,
  appName: string,
};

const WheelmapHomeLink = (props: Props) => (
  <a
    className={props.className}
    href={props.href}
    // translator: The link name to go from the embedded to the complete app
    aria-label={t`Go to ${props.appName}`}
    target="_blank"
    rel="noreferrer noopener"
  >
    {/* translator: The alternative desription of the app logo for screenreaders */}
    <img className="logo" src={props.logoURL} width={156} height={30} alt={t`App Logo`} />
  </a>
);

const StyledWheelmapHomeLink = styled(WheelmapHomeLink)`
  border-radius: 2px;
  background-color: rgba(254, 254, 254, 0.8);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

export default StyledWheelmapHomeLink;

const PositionedWheelmapHomeLink = styled(WheelmapHomeLink)`
position: absolute;
top: 10px;
right: 70px;
z-index: 1001;

@media (max-width: 512px) {
  right: initial;
  left: 10px;
}
`;
  renderWheelmapHomeLink() {
    if (typeof window !== 'undefined') {
      const { clientSideConfiguration } = this.props.app;
      const appName = translatedStringFromObject(clientSideConfiguration.textContent.product.name);
      const { logoURL } = clientSideConfiguration;

      const queryParams = queryString.parse(window.location.search);
      delete queryParams.embedded;
      const queryStringWithoutEmbeddedParam = queryString.stringify(queryParams);

      const homeLinkHref = `${window.location.origin}${window.location.pathname}?${queryStringWithoutEmbeddedParam}`;

      return <PositionedWheelmapHomeLink href={homeLinkHref} appName={appName} logoURL={logoURL} />;
    }
  }
