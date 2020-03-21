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

trackMappingEventMembershipChanged = (
  reason: 'url' | 'button',
  joinedMappingEventId?: string,
  emailAddress?: string
) => {
  storeJoinedMappingEventId(joinedMappingEventId);
  const search: string = window.location.search;

  if (joinedMappingEventId) {
    const token = this.props.router.query.token;
    const invitationToken = Array.isArray(token) ? token[0] : token;
    setJoinedMappingEventData(emailAddress, invitationToken);

    trackingEventBackend.track(this.props.app, {
      invitationToken,
      emailAddress,
      type: 'MappingEventJoined',
      joinedMappingEventId: joinedMappingEventId,
      joinedVia: reason,
      query: queryString.parse(search),
    });
    trackEvent({
      category: 'MappingEvent',
      action: 'Joined',
      label: joinedMappingEventId,
    });
  }
};

onMappingEventLeave = () => {
  this.trackMappingEventMembershipChanged('button');
  this.setState({ joinedMappingEventId: null });
};

onMappingEventJoin = (joinedMappingEventId: string, emailAddress?: string) => {
  this.trackMappingEventMembershipChanged('button', joinedMappingEventId, emailAddress);
  this.setState({
    joinedMappingEventId,
  });
  const params = this.getCurrentParams();
  this.props.routerHistory.replace('mappingEventDetail', params);
};

onMappingEventWelcomeDialogOpen = () => {
  const params = this.getCurrentParams();
  this.props.routerHistory.replace('mappingEventJoin', params);
};

onMappingEventWelcomeDialogClose = () => {
  const params = this.getCurrentParams();
  this.props.routerHistory.replace('mappingEventDetail', params);
};


renderMappingEventWelcomeDialog() {
  const {
    mappingEvent,
    onMappingEventJoin,
    onMappingEventWelcomeDialogClose,
    invitationToken,
  } = this.props;

  if (!mappingEvent) {
    return null;
  }

  return (
    <MappingEventWelcomeDialog
      mappingEvent={mappingEvent}
      onJoin={onMappingEventJoin}
      onClose={onMappingEventWelcomeDialogClose}
      invitationToken={invitationToken}
    />
  );
}
