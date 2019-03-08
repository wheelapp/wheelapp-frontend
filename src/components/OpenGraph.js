// @flow
import React, { PureComponent } from 'react';
import Head from 'next/head';

type Props = {
  productName: ?string,
  title: ?string,
  description: ?string,
};

class OpenGraph extends PureComponent<Props> {
  render() {
    const { productName, title, description } = this.props;

    return (
      <Head>
        <meta content={productName} property="og:site_name" key="og:site_name" />
        <meta content={title} property="og:title" key="og:title" />
        <meta content={description} property="og:description" key="og:description" />
        <meta content="website" property="og:type" key="og:type" />
      </Head>
    );
  }
}

export default OpenGraph;
