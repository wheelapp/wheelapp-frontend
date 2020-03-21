import NextHead from 'next/head';
import { t } from 'ttag';

function Page({ data }) {
  return (
    <div>
      <NextHead>
        <title key="title">{t`Thank you for the contribution!`}</title>
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
renderContributionThanksDialog() {
  const { customMainMenuLinks } = this.props.app.clientSideConfiguration;

  // find add place link
  const link = find(customMainMenuLinks, link => includes(link.tags, 'add-place'));

  return (
    <AppContextConsumer>
      {appContext => {
        const url = link
          ? insertPlaceholdersToAddPlaceUrl(
              appContext.baseUrl,
              translatedStringFromObject(link.url) || '',
              this.state.uniqueSurveyId
            )
          : null;

        return (
          <FocusTrap active={this.props.modalNodeState === 'contribution-thanks'}>
            <ContributionThanksDialog
              hidden={this.props.modalNodeState !== 'contribution-thanks'}
              onClose={this.props.onCloseModalDialog}
              addPlaceUrl={url}
              appContext={appContext}
            />
          </FocusTrap>
        );
      }}
    </AppContextConsumer>
  );
}
adsasd trackModalView('contribution-thanks');