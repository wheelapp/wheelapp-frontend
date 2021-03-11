import * as React from 'react';
import fetch from 'isomorphic-unfetch';
import useSWR from 'swr';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/core/lib/css/blueprint.css'
import { ItemRenderer, Omnibar } from '@blueprintjs/select';
import { MenuItem, Button, HotkeysTarget2, KeyCombo } from '@blueprintjs/core';
import { createGlobalStyle } from 'styled-components';
import env from '../../lib/env';


type Props = {
  query: string,
  onChange: (query: string) => void,
};

// const items: any[] = [
//   { _id: 'hrACXcGx6f52vd2na', _name: 'Kreuzberg Apotheke', _cat: 'pharmacy', _score: 16.735723,wheelchairAccessibility: true },
//   {
//     _id: 'd2MewHxR8cKhbkE7a',
//     _name: 'Apotheke am Kottbusser Tor',
//     _cat: 'pharmacy',
//     _score: 16.591202,
//   },
//   { _id: 'B4YLxhnTmGpHBP4X2', _name: 'Kreuzberg Apotheke', _cat: 'pharmacy', _score: 16.389927 },
//   {
//     _id: 'atJMAskoFGMmDcs5m',
//     _name: 'Apotheke zum Goldenen Einhorn',
//     _cat: 'pharmacy',
//     _score: 15.835242,
//   },
//   { _id: 'D3ABajvQsfFXsgxCY', _name: 'Vital-Apotheke', _cat: 'pharmacy', _score: 15.600796,wheelchairAccessibility: true },
//   { _id: 'qLyvEzXy3bPYuBpGw', _name: 'Springers Apotheke', _cat: 'pharmacy', _score: 15.600796,wheelchairAccessibility: true },
//   { _id: 'qD7d434eEhKq9xPZa', _name: 'Apotheke zum Schwan', _cat: 'pharmacy', _score: 15.600796,wheelchairAccessibility: true },
//   { _id: '48ChZbW8rgbfECd92', _name: 'Eick Apotheke', _cat: 'pharmacy', _score: 15.600796,wheelchairAccessibility: true },
//   { _id: 'F5rvBeKfv2ruoSv6h', _name: 'Lazarus Apotheke', _cat: 'pharmacy', _score: 15.600796,wheelchairAccessibility: true },
//   { _id: 'Z73mQmRdHnuZLhHRb', _name: 'Mohren-Apotheke', _cat: 'pharmacy', _score: 15.600796,wheelchairAccessibility: undefined },
// ];

const ResultsOmnibar = Omnibar.ofType<any>();


const PushBlueprintjsPortalToTop = createGlobalStyle`
  .bp3-portal {
    z-index: 10000
  }
`



const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    // headers: {
    //   Authorization: "Basic " + btoa(`${usr}:${pwd}`), // replace with native base64 for other browsers
      
    //   "Content-Type": "application/json",
    //   Accept: "application/json",
    // },
  }).then((r) => r.json());

export const SearchOmnibar = (props: Props) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { data, error } = useSWR('/api/search/accessibility-cloud.placeinfos/_search?q=' + props.query, fetcher);

  React.useEffect(() => {
    if (props.query?.length > 0) {
      setIsOpen(true);
    }
  }, [props.query]);




  const handleToggle = React.useCallback(() => {
    setIsOpen(!isOpen);
  }, []);

  const handleClick = React.useCallback((_event: React.MouseEvent<HTMLElement>) => {
    setIsOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemSelect = React.useCallback((item: any) => {
    setIsOpen(false);
    alert(JSON.stringify(item)); 
  }, []);



  const resultItemRenderer: ItemRenderer<any> = (item, { handleClick, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }

    const name = `${item._name}`;
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        label={item._score.toString()}
        key={item._id}
        onClick={handleClick}
        text={name}
      />
    );
  };



  return (
    <HotkeysTarget2
      hotkeys={[
        {
          combo: 'shift + o',
          global: true,
          label: 'Show SearchOmniBar',
          onKeyDown: handleToggle,
          preventDefault: true,
        },
      ]}
    >
      <div>
        <PushBlueprintjsPortalToTop />
        <ResultsOmnibar
          query={props.query}
          isOpen={isOpen}
          noResults={<MenuItem disabled={true} text="No results." />}
          onClose={handleClose}
          items={data?.hits?.hits || []}
          itemRenderer={resultItemRenderer}
          onItemSelect={handleItemSelect}
          onQueryChange={props.onChange}
        ></ResultsOmnibar>
      </div>
    </HotkeysTarget2>
  );
};
