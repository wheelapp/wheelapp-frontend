import React, { Dispatch, SetStateAction, useState, createContext } from 'react';
// import { IPlace}  from "../Places/places";
/**
 * Context for elastic search results
 *
 * TOSO: Add type for context
 */

export const PlaceContext = createContext<any[] | []>([]);
export const UpdatePlaceContext = createContext<Dispatch<SetStateAction<any[] | []>>>(() => []);

// PlacesProvider
export function PlacesProvider({ children }: any) {
  const [places, setPlaces] = useState<any[]>([]);

  return (
    <PlaceContext.Provider value={places}>
      <UpdatePlaceContext.Provider value={setPlaces}>{children}</UpdatePlaceContext.Provider>
    </PlaceContext.Provider>
  );
}
