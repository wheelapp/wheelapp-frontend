import React from 'react';

/**
 * Context for FilterToolbar isOpen state
 */

const FilterToolbarIsOpenContext = React.createContext(null);
const UpdateFilterToolbarIsOpenContext = React.createContext(null);

// custom hooks to be able to access this above context in child components
export function useFilterToolbarIsOpenContext() {
  return React.useContext(FilterToolbarIsOpenContext);
}
export function useUpdateFilterToolbarIsOpenContext() {
  return React.useContext(UpdateFilterToolbarIsOpenContext);
}

// InputProvider
export function FilterToolbarIsOpenContextProvider({ children }) {

  const [isFilterToolbarOpenTest, setIsFilterToolbarOpenTest] = React.useState<boolean>(false);

  function setIsOpen(isOpen) {
    setIsFilterToolbarOpenTest(isOpen);
  }

  return (
    <FilterToolbarIsOpenContext.Provider value={isFilterToolbarOpenTest}>
      <UpdateFilterToolbarIsOpenContext.Provider value={setIsOpen}>
        {children}
      </UpdateFilterToolbarIsOpenContext.Provider>
    </FilterToolbarIsOpenContext.Provider>
  );
}
