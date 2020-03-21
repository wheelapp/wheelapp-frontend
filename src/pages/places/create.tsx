import NextHead from 'next/head';
import { t } from 'ttag';

function Page({ data }) {
  return (
    <div>
      <NextHead>
        <title key="title">{t`Add a new place`}</title>
      </NextHead>
      TODO
    </div>
  );
}

// This gets called on every request
// export async function getServerSideProps() {
//   // Fetch data from external API
//   const res = await fetch(`https://.../data`)
//   const data = await res.json()

//   // Pass data to the page via props
//   return { props: { data } }
// }

export default Page;

renderCreateDialog() {
  return (
    <FocusTrap active={this.props.modalNodeState === 'create'}>
      <CreatePlaceDialog
        hidden={this.props.modalNodeState !== 'create'}
        onClose={this.props.onCloseModalDialog}
        lat={this.props.lat}
        lon={this.props.lon}
      />
    </FocusTrap>
  );
}


trackModalView('create');

this.setState(() => ({ uniqueSurveyId: uuidv4() }));