import fetch from 'node-fetch';

function Page({ data }) {
  return <div>TODO</div>;
}

<title key="title">{getProductTitle(props.app.clientSideConfiguration)}</title>;

// This gets called on every request
// export async function getServerSideProps() {
//   // Fetch data from external API
//   const res = await fetch(`https://.../data`)
//   const data = await res.json()

//   // Pass data to the page via props
//   return { props: { data } }
// }

export default Page;
import React from 'react';

import { getProductTitle } from '../lib/model/ClientSideConfiguration';
if (isFirstStart()) {
  this.setState({ isOnboardingVisible: true });
} else 