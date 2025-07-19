import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { NetworkTables } from 'ntcore-ts-client';

export const NTCoreContext = createContext<NetworkTables>(NetworkTables.getInstanceByTeam(3245));
// export const NTCoreContext = createContext<NetworkTables | null>(NetworkTables.getInstanceByTeam(3245));

type NTCoreProviderProps = {
  children: ReactNode;
};

/*
export function NTCoreProvider({ children }: NTCoreProviderProps) {
  const [ntCore, setNTCore] = useState<NetworkTables | null>(null);

  useEffect(() => {
    setNTCore(NetworkTables.getInstanceByTeam(3245));
  }, []);

  return (
    <NTCoreContext.Provider value={ntCore}>{children}</NTCoreContext.Provider>
  );
}
*/

export function useNTCore() {
  return useContext(NTCoreContext);
}