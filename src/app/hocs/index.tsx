import {
  ApiProvider as GearApiProvider,
  AlertProvider as GearAlertProvider,
  AccountProvider,
  ProviderProps,
} from '@gear-js/react-hooks';
import { ComponentType } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ADDRESS } from '@/app/consts';
import { Alert, alertStyles } from '@/components/ui/alert';
import { HexString } from "@gear-js/api";
import { KeyringPair } from '@polkadot/keyring/types';
import { createContext, useState } from "react";

interface Props {
    children: JSX.Element
}

interface DAppContextI {
  currentVoucherId: HexString | null, 
  signlessAccount: KeyringPair | null,
  noWalletSignlessAccountName: string | null,
  setSignlessAccount: React.Dispatch<React.SetStateAction<KeyringPair | null>> | null,
  setNoWalletSignlessAccountName: React.Dispatch<React.SetStateAction<string | null>> | null,
  setCurrentVoucherId: React.Dispatch<React.SetStateAction<HexString | null>> | null
}

export const dAppContext = createContext<DAppContextI>({
  currentVoucherId: null,
  signlessAccount: null,
  noWalletSignlessAccountName: null,
  setSignlessAccount: null,
  setNoWalletSignlessAccountName: null,
  setCurrentVoucherId: null
});   

export const DAppContextProvider = ({ children }: Props)  => {
  const [currentVoucherId, setCurrentVoucherId] = useState<HexString | null>(null);
  const [signlessAccount, setSignlessAccount] = useState<KeyringPair | null>(null);
  const [noWalletSignlessAccountName, setNoWalletSignlessAccountName] = useState<string | null>(null);

  return (
      <dAppContext.Provider 
          value={{
              currentVoucherId,
              signlessAccount,
              noWalletSignlessAccountName,
              setCurrentVoucherId,
              setSignlessAccount,
              setNoWalletSignlessAccountName
          }}
      >
          {children}
      </dAppContext.Provider>
  );
}

function ApiProvider({ children }: ProviderProps) {
  return <GearApiProvider initialArgs={{ endpoint: ADDRESS.NODE }}>{children}</GearApiProvider>;
}

function AlertProvider({ children }: ProviderProps) {
  return (
    <GearAlertProvider template={Alert} containerClassName={alertStyles.root}>
      {children}
    </GearAlertProvider>
  );
}

const providers = [BrowserRouter, DAppContextProvider,AlertProvider, ApiProvider, AccountProvider];

function withProviders(Component: ComponentType) {
  return () => providers.reduceRight((children, Provider) => <Provider>{children}</Provider>, <Component />);
}

export { withProviders };