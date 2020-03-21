import { t } from 'ttag';
import * as React from 'react';
import FlagIcon from '../../icons/actions/Flag';
import { Feature } from '../../../lib/types/Feature';

type Props = {
  equipmentInfoId: string | null,
  feature: Feature | null,
  onClick: () => void,
};

export default function ReportIssueButton(props: Props) {
  // translator: Button caption shown in the PoI details panel
  const caption = t`Report a problem`;
  return (
    <button className="link-button full-width-button" onClick={props.onClick}>
      <FlagIcon />
      <span>{caption}</span>
    </button>
  );
}
