import { ApiRx } from '@polkadot/api';
import React, { Context, useCallback, useContext, useRef, useState } from 'react';
import { ApiContext } from './api.provider';
import { zip, from, Subscription } from 'rxjs';
import { finalize, tap, mergeMap } from 'rxjs/operators';
import type { SignedBlock } from '@polkadot/types/interfaces';
import type { GenericExtrinsic } from '@polkadot/types';
import type { AnyTuple } from '@polkadot/types/types';
import type { ExtendedEventRecord } from '../../shared';

export type Extrinsic = GenericExtrinsic<AnyTuple> & {
  events: ExtendedEventRecord[];
  successed: boolean;
}

export type Block  = SignedBlock & {
  blockHash: string;
  height: number;
  extrinsics: Extrinsic[];
};

interface BlockContextProps {
  blocks: Block[];
  backward: (height: number) => void;
  backwarding: boolean;
  clear: () => void;
  retrive: () => void;
}

export const BlocksContext: Context<BlockContextProps> = React.createContext({}as unknown as BlockContextProps);

const patchBlocks = (oldBlocks: Block[], newBlocks: Block[]) => {
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
  extrinsics: Extrinsic[];
}> => {
  const [ block, events ] = await zip(
    api.rpc.chain.getBlock(blockHash),
    api.query.system.events.at(blockHash),
  ).toPromise();

  const extrinsics: Extrinsic[] = block.block.extrinsics.map((extrinsic, index) => {
    const _events: ExtendedEventRecord[] = events
      .map((event, eventIndex): ExtendedEventRecord => Object.assign(event, {
        indexInBlock: eventIndex + 1,
        blockHeight: height,
      }))
      .filter(({ phase }) =>
        phase.isApplyExtrinsic &&
          phase.asApplyExtrinsic.eq(index)
      );

    return Object.assign(extrinsic, {
      events: _events,
      successed: !!_events.find(event => event.event.section === 'system' && event.event.method === 'ExtrinsicSuccess'),
    })
  });

  return {
    block,
    extrinsics,
  };
};

const retriveBlocks = async (api: ApiRx, endHeight: number, startHeight = 0): Promise<Block[]> => {
  type NullableBlock = Block | null;

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

          return Object.assign(block, {
            blockHash: blockHash.toString(),
            height: startHeight + i,
            extrinsics,
          });
        // avoid failed casued by some requests
        } catch (e) {
          return null;
        }
      })
  );

  console.log('Retrive Blocks From Node:', `${startHeight} -> ${endHeight}`, blocks.filter(block => !!block).map(b => b?.toHuman()));

  // filter some failures
  return blocks.filter(block => !!block) as Block[];
};

const retriveLatestBlocks = async (api: ApiRx, startIndex = 0): Promise<Block[]> => {
  const header = await api.rpc.chain.getHeader().toPromise();

  return retriveBlocks(api, header.number.toNumber(), startIndex);
};

export const BlocksProvider = React.memo(({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { api } = useContext(ApiContext);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [ backwarding, setBackwarding ] = useState<boolean>(false);
  const blocksRef = useRef<Block[]>([]);
  const [ sub, setSub ] = useState<Subscription>();

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

  const retrive = useCallback(() => {
    if (!api || !api.isReady) { 
      return;
    }

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
  }, [api, sub]);

  return <BlocksContext.Provider value={{
      blocks,
      backward,
      backwarding,
      clear,
      retrive,
    }}>{children}</BlocksContext.Provider>;
  }
);
