import { ApiRx } from '@polkadot/api';
import React, { Context, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ApiContext } from './api.provider';
import { zip } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { SignedBlock } from '@polkadot/types/interfaces';
import type { GenericExtrinsic } from '@polkadot/types';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import type { AnyTuple } from '@polkadot/types/types';

export type Extrinsic = GenericExtrinsic<AnyTuple> & {
  events: EventRecord[];
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

const retriveBlock = async (api: ApiRx, blockHash: string): Promise<{
  block: SignedBlock;
  extrinsics: Extrinsic[];
}> => {
  const [ block, events ] = await zip(
    api.rpc.chain.getBlock(blockHash),
    api.query.system.events.at(blockHash),
  ).toPromise();

  const extrinsics: Extrinsic[] = block.block.extrinsics.map((extrinsic, index) =>
    Object.assign(extrinsic, {
      events: events.filter(({ phase }) =>
        phase.isApplyExtrinsic &&
          phase.asApplyExtrinsic.eq(index)
      ),
    })
  );

  return {
    block,
    extrinsics,
  };
};

const retriveBlocks = async (api: ApiRx, endHeight: number, startHeight = 1): Promise<Block[]> => {
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
          const { block, extrinsics } = await retriveBlock(api, blockHash.toString());

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

const retriveLatestBlocks = async (api: ApiRx, startIndex = 1): Promise<Block[]> => {
  const header = await api.rpc.chain.getHeader().toPromise();

  return retriveBlocks(api, header.number.toNumber(), startIndex);
};

export const BlocksProvider = React.memo(({ children }: { children: React.ReactNode }): React.ReactElement => {
    const { api, isApiReady, systemName } = useContext(ApiContext);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [ backwarding, setBackwarding ] = useState<boolean>(false);
    const blocksRef = useRef<Block[]>([]);

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
      if (!isApiReady) { 
        return;
      }

      retriveLatestBlocks(api).then(
        _blocks => {
          blocksRef.current = _blocks;
          setBlocks(_blocks);
        },
        () => {},
      ).then(() =>
        api.derive.chain.subscribeNewHeads().subscribe(async header => {
          console.log('new header: ', header.number.toNumber(), header.toHuman());

          const { block, extrinsics } = await retriveBlock(
            api,
            header.hash.toString(),
          );
          
          blocksRef.current = patchBlocks(blocksRef.current, [
            Object.assign(block, {
              blockHash: header.hash.toString(),
              height: header.number.toNumber(),
              extrinsics,
            })
          ]);
          setBlocks(blocksRef.current);
        }),
        () => {},
      );
    }, [api, isApiReady, systemName]);

    return <BlocksContext.Provider value={{
      blocks,
      backward,
      backwarding,
    }}>{children}</BlocksContext.Provider>;
  }
);
