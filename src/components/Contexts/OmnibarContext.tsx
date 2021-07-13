import React from 'react';

/**
 * Context for Omnibar isOpen state
 */

const OmnibarIsOpenContext = React.createContext(null);
const UpdateOmnibarIsOpenContext = React.createContext(null);

// custom hooks to be able to access this above context in child components
export function useOmnibarIsOpenContext() {
  return React.useContext(OmnibarIsOpenContext);
}
export function useUpdateOmnibarIsOpenContext() {
  return React.useContext(UpdateOmnibarIsOpenContext);
}

// InputProvider
export function OmnibarIsOpenContextProvider({ children }) {
  const [isOpen, setIsOpenState] = React.useState<boolean>(false);

  function setIsOpen(isOpen) {
    setIsOpenState(isOpen);
  }

  return (
    <OmnibarIsOpenContext.Provider value={isOpen}>
      <UpdateOmnibarIsOpenContext.Provider value={setIsOpen}>
        {children}
      </UpdateOmnibarIsOpenContext.Provider>
    </OmnibarIsOpenContext.Provider>
  );
}
