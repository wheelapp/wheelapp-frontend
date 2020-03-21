import { t } from 'ttag';
import { KeyboardEventHandler } from 'react';
import Link from 'next/link';

interface Props {
  logoURL: string;
  productName: string;
  onKeyDown: KeyboardEventHandler<HTMLAnchorElement>;
}

export default function HomeLink(props: Props) {
  return (
    <div className="home-link">
      <Link href="/">
        <a className="btn-unstyled home-button" aria-label={t`Home`} onKeyDown={props.onKeyDown}>
          <img
            className="logo"
            src={props.logoURL}
            width={156}
            height={30}
            alt={props.productName}
          />
        </a>
      </Link>
    </div>
  );
}
