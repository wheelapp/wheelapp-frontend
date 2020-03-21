import React, { PureComponent } from 'react';

import { TwitterConfiguration } from '../lib/ClientSideConfiguration';

type Props = TwitterConfiguration & {
  productName?: string,
  description?: string,
};

class TwitterMeta extends PureComponent<Props> {
  render() {
    const { creatorHandle, siteHandle, imageURL, productName, description } = this.props;

    if (!creatorHandle && !siteHandle) {
      return null;
    }

    return (
      <>
        <meta content="summary" property="twitter:card" key="twitter:card" />
        {siteHandle && <meta content={siteHandle} property="twitter:site" key="twitter:site" />}
        {creatorHandle && (
          <meta content={creatorHandle} property="twitter:creator" key="twitter:creator" />
        )}
        <meta content={description} property="twitter:description" key="twitter:description" />
        <meta content={productName} property="twitter:title" key="twitter:title" />
        {imageURL && <meta content={imageURL} property="twitter:image" key="twitter:image" />}
      </>
    );
  }
}

export default TwitterMeta;
