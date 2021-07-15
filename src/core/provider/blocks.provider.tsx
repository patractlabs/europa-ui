import { ApiRx } from '@polkadot/api';
import React, { Context, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ApiContext } from './api.provider';
import { zip, from, Subscription } from 'rxjs';
import { finalize, tap, mergeMap } from 'rxjs/operators';
import type { SignedBlock } from '@polkadot/types/interfaces';
import type { GenericExtrinsic } from '@polkadot/types';
import type { AnyTuple } from '@polkadot/types/types';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import { getBlockTimestamp, lookForDestAddress } from '../../shared';

export type ExtendedExtrinsic = GenericExtrinsic<AnyTuple> & {
  events: ExtendedEventRecord[];
  successed: boolean;
  height: number;
  blockHash: string;
  indexInBlock: number;
  timestamp: number;
  to: string;
}

export type ExtendedBlock  = SignedBlock & {
  blockHash: string;
  height: number;
  extrinsics: ExtendedExtrinsic[];
};

export interface ExtendedEventRecord extends EventRecord {
  blockHeight?: number;
};

interface BlockContextProps {
  blocks: ExtendedBlock[];
  backward: (height: number) => void;
  backwarding: boolean;
  clear: () => void;
  update: () => void;
}

export const BlocksContext: Context<BlockContextProps> = React.createContext({}as unknown as BlockContextProps);

const patchBlocks = (oldBlocks: ExtendedBlock[], newBlocks: ExtendedBlock[]) => {
  if (!newBlocks.length) {
    return [...oldBlocks];
  }

  let sliceIndex = oldBlocks.findIndex((block) => block.height >= newBlocks[0].height);

  sliceIndex = sliceIndex < 0 ? oldBlocks.length : sliceIndex;

  return [
    ...oldBlocks.slice(0, sliceIndex),
    ...newBlocks
  ];
};

const retriveBlock = async (api: ApiRx, blockHash: string, height: number): Promise<{
  block: SignedBlock;
  extrinsics: ExtendedExtrinsic[];
}> => {
  const [ block, events ] = await zip(
    api.rpc.chain.getBlock(blockHash),
    api.query.system.events.at(blockHash),
  ).toPromise();

  const extrinsics: ExtendedExtrinsic[] = block.block.extrinsics.map((extrinsic, index) => {
    const _events: ExtendedEventRecord[] = events
      .map((event): ExtendedEventRecord => Object.assign(event, {
        blockHeight: height,
      }))
      .filter(({ phase }) =>
        phase.isApplyExtrinsic &&
          phase.asApplyExtrinsic.eq(index)
      );

    return Object.assign(extrinsic, {
      timestamp: getBlockTimestamp(block.block.extrinsics),
      blockHash,
      indexInBlock: index,
      events: _events,
      height,
      to: lookForDestAddress(extrinsic),
      successed: !!_events.find(event => event.event.section === 'system' && event.event.method === 'ExtrinsicSuccess'),
    });
  });

  return {
    block,
    extrinsics,
  };
};

const retriveBlocks = async (api: ApiRx, endHeight: number, startHeight = 0): Promise<ExtendedBlock[]> => {
  type NullableBlock = ExtendedBlock | null;

  if (endHeight < startHeight) {
    return [];
  }

  const blocks: NullableBlock[] = await Promise.all(
    (new Array(endHeight - startHeight + 1))
      .fill(1)
      .map(async (_, i) => {
        try {
          const blockHash = await api.rpc.chain.getBlockHash(startHeight + i).toPromise();
          const { block, extrinsics } = await retriveBlock(api, blockHash.toString(), startHeight + i);
          const extendedBlock: ExtendedBlock = Object.assign(block, {
            blockHash: blockHash.toString(),
            height: startHeight + i,
            extrinsics,
          });

          return extendedBlock;
        // avoid failed casued by some requests
        } catch (e) {
          return null;
        }
      })
  );

  console.log('Retrive Blocks From Node:', `${startHeight} -> ${endHeight}`, blocks.filter(block => !!block).map(b => b?.toHuman()));

  // filter some failures
  return blocks.filter(block => !!block) as ExtendedBlock[];
};

const retriveLatestBlocks = async (api: ApiRx, startIndex = 0): Promise<ExtendedBlock[]> => {
  const header = await api.rpc.chain.getHeader().toPromise();

  return retriveBlocks(api, header.number.toNumber(), startIndex);
};

let lastSignal = 0;

export const BlocksProvider = React.memo(({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { api } = useContext(ApiContext);
  const [blocks, setBlocks] = useState<ExtendedBlock[]>([]);
  const [signal, setSignal] = useState<number>(0);
  const [ backwarding, setBackwarding ] = useState<boolean>(false);
  const blocksRef = useRef<ExtendedBlock[]>([]);
  const [ sub, setSub ] = useState<Subscription>();

  const update = useCallback(() => setSignal(old => old + 1), [setSignal]);

  const clear = useCallback(() => {
    blocksRef.current = [];
    setBlocks([]);
  }, []);

  const backward = useCallback((height: number) => {
    setBackwarding(true);

    (api as any).rpc.europa.backwardToHeight(height).pipe(
      finalize(() => setBackwarding(false)),
    ).subscribe(
      async () => {
        const _blocks = await retriveLatestBlocks(api);
        
        blocksRef.current = _blocks;
        setBlocks(_blocks);
      },
      () => console.log('bad backward'),
    );
  }, [api]);

  useEffect(() => {
    if (!api || !api.isReady || !signal || lastSignal === signal) {
      return;
    }

    lastSignal = signal;
    sub && sub.unsubscribe();

    const newSub = from(retriveLatestBlocks(api)).pipe(
      tap(_blocks => {
        blocksRef.current = _blocks;
        setBlocks(_blocks);

        console.log('retive blocks', _blocks);
      }),
      mergeMap(() => api.derive.chain.subscribeNewHeads()),
    ).subscribe(async header => {
        console.log('new header: height=' + header.number.toNumber());

        try {
          const { block, extrinsics } = await retriveBlock(
            api,
            header.hash.toString(),
            header.number.toNumber(),
          )

          blocksRef.current = patchBlocks(blocksRef.current, [
            Object.assign(block, {
              blockHash: header.hash.toString(),
              height: header.number.toNumber(),
              extrinsics,
            })
          ]);
          setBlocks(blocksRef.current);
        } catch (e) {
          console.log('Error when fetching new header', e)
        }
    }, (e) => {console.log('err', e)});

    setSub(newSub);
  }, [api, sub, signal]);

  return <BlocksContext.Provider value={{
      blocks,
      backward,
      backwarding,
      clear,
      update,
    }}>{children}</BlocksContext.Provider>;
  }
);
