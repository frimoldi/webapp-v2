import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, take } from 'rxjs/operators';
import { getNetworkVariables } from 'services/web3/config';
import { setProvider } from 'services/web3';
import { EthNetworks } from 'services/web3/types';
import { buildAlchemyUrl } from 'services/web3/wallet/connectors';
import { providers } from 'ethers';

export const getChainID = (chain: string | number): EthNetworks =>
  typeof chain === 'string' ? parseInt(chain) : chain;

export const currentNetworkReceiver$ = new BehaviorSubject<number>(
  EthNetworks.Mainnet
);

export const currentNetwork$ = currentNetworkReceiver$.pipe(
  distinctUntilChanged(),
  shareReplay(1)
);

export const setNetwork = async (chainId: EthNetworks) => {
  const currentChain = await currentNetworkReceiver$.pipe(take(1)).toPromise();
  if (
    (chainId === EthNetworks.Mainnet || chainId === EthNetworks.Ropsten) &&
    currentChain !== chainId
  ) {
    setProvider(new providers.WebSocketProvider(buildAlchemyUrl(chainId)));
    currentNetworkReceiver$.next(chainId);
  }
};

export const networkVars$ = currentNetwork$.pipe(
  map(getNetworkVariables),
  shareReplay(1)
);
