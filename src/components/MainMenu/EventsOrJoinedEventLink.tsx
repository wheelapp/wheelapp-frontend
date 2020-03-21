import Link from 'next/link';
import { useRouter } from 'next/router';
import { omit } from 'lodash';
import { t } from 'ttag';
import { HTMLProps } from 'react';

interface Props extends HTMLProps<HTMLAnchorElement> {
  label?: string;
}

export default function EventsOrJoinedEventLink(props: Props) {
  const joinedMappingEvent = this.props.joinedMappingEvent;
  if (joinedMappingEvent) {
    return (
      <Link href="/events/[id]" as={`events/${joinedMappingEvent._id}`}>
        <a {...props} role="menuitem">
          {joinedMappingEvent.name}
        </a>
      </Link>
    );
  }

  const router = useRouter();
  const query = omit(router.query, 'id');

  return (
    <Link href={{ pathname: '/events', query }}>
      <a {...props} role="menuitem">
        {props.label}
      </a>
    </Link>
  );
}
