import { t } from 'ttag';

const getClassicCategories = () => [
  { id: 1, identifier: 'public_transfer', localized_name: t`Transit` },
  { id: 2, identifier: 'food', localized_name: t`Food & Drinks` },
  { id: 3, identifier: 'leisure', localized_name: t`Leisure` },
  { id: 4, identifier: 'money_post', localized_name: t`Finance` },
  { id: 5, identifier: 'education', localized_name: t`Education` },
  { id: 6, identifier: 'shopping', localized_name: t`Shopping` },
  { id: 7, identifier: 'sport', localized_name: t`Sport` },
  { id: 8, identifier: 'tourism', localized_name: t`Tourism` },
  { id: 9, identifier: 'accommodation', localized_name: t`Accomodation` },
  { id: 10, identifier: 'misc', localized_name: t`Miscellaneous` },
  { id: 11, identifier: 'government', localized_name: t`Authorities` },
  { id: 12, identifier: 'health', localized_name: t`Health` },
];

export default getClassicCategories;
