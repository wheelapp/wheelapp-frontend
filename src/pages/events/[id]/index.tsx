import fetch from 'node-fetch';

function Page({ data }) {
  return <div>TODO</div>;
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

if (routeName === 'mappingEventDetail') {
  const mappingEvent = this.props.mappingEvents.find(event => event._id === this.props.featureId);
  if (mappingEvent) {
    pageTitle = translatedProductName
      ? `${mappingEvent.name} - ${translatedProductName}`
      : mappingEvent.name;
    translatedDescription = mappingEvent.description || mappingEvent.name;

    const mappingEventImage = mappingEvent.images && mappingEvent.images[0];
    const mappingEventImageUrl = mappingEventImage && buildFullImageUrl(mappingEventImage);

    facebookMetaData.imageURL = mappingEventImageUrl || `${baseUrl}/images/eventPlaceholder.png`;

    // 2048x1288 is the dimension of the placeholder image
    facebookMetaData.imageWidth = mappingEventImage ? mappingEventImage.dimensions.width : 2048;
    facebookMetaData.imageHeight = mappingEventImage ? mappingEventImage.dimensions.height : 1288;

    twitterMetaData.imageUrl = mappingEventImageUrl || `${baseUrl}/images/eventPlaceholder.png`;
    ogUrl = `${baseUrl}/events/${mappingEvent._id}`;
  }
}


import * as React from 'react';
import { DataTableEntry, RenderContext } from './getInitialProps';
import { MappingEvent } from '../lib/MappingEvent';
import { translatedStringFromObject } from '../lib/i18n';

type MappingEventDetailDataProps = {
  mappingEvent: MappingEvent,
};

const MappingEventDetailData: DataTableEntry<MappingEventDetailDataProps> = {
  getHead({ mappingEvent, app }) {
    const translatedProductName = translatedStringFromObject(
      app.clientSideConfiguration.textContent.product.name
    );
    const title = translatedProductName
      ? `${mappingEvent.name} - ${translatedProductName}`
      : mappingEvent.name;
    return <title key="title">{title}</title>;
  },

  getMappingEvent(eventId: string, renderContext: RenderContext) {
    return renderContext.mappingEvents.find(event => event._id === eventId);
  },

  async getInitialRouteProps(query, renderContextPromise, isServer) {
    const renderContext = await renderContextPromise;
    const mappingEvent = this.getMappingEvent(query.id, renderContext);
    const eventFeature = mappingEvent.meetingPoint;

    return {
      ...renderContext,
      mappingEvent,
      feature: eventFeature,
      featureId: mappingEvent._id,
    };
  },
};

export default MappingEventDetailData;


renderMappingEventToolbar() {
  const {
    mappingEvent,
    joinedMappingEventId,
    onMappingEventLeave,
    onMappingEventWelcomeDialogOpen,
    onCloseMappingEventsToolbar,
    app,
    mappingEventHandlers,
  } = this.props;

  if (!mappingEvent) {
    return null;
  }

  const productName = app.clientSideConfiguration.textContent.product.name;
  const translatedProductName = translatedStringFromObject(productName);

  const focusTrapActive = !this.isAnyDialogVisible();

  return (
    <AppContextConsumer>
      {({ preferredLanguage }) => (
        <MappingEventToolbar
          mappingEvent={mappingEvent}
          joinedMappingEventId={joinedMappingEventId}
          onMappingEventWelcomeDialogOpen={onMappingEventWelcomeDialogOpen}
          onMappingEventLeave={onMappingEventLeave}
          onClose={onCloseMappingEventsToolbar}
          onHeaderClick={this.onMappingEventHeaderClick}
          productName={translatedProductName}
          focusTrapActive={focusTrapActive}
          preferredLanguage={preferredLanguage}
          mappingEventHandlers={mappingEventHandlers}
        />
      )}
    </AppContextConsumer>
  );
}
