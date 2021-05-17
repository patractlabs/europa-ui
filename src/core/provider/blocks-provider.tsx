import { ApiRx } from '@polkadot/api';
import React, { Context, useContext, useEffect, useRef, useState } from 'react';
import { ApiContext } from './api-provider';
import { zip } from 'rxjs';
import type { SignedBlock } from '@polkadot/types/interfaces';
import type { GenericExtrinsic } from '@polkadot/types';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import type { AnyTuple } from '@polkadot/types/types';

export type Extrinsic = GenericExtrinsic<AnyTuple> & {
  events: EventRecord[];
}

export type Block  = SignedBlock & {
  height: number;
  extrinsics: Extrinsic[];
};

interface BlockContextProps {
  blocks: Block[];
}

export const BlocksContext: Context<BlockContextProps> = React.createContext({}as unknown as BlockContextProps);

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

  if (endHeight <= startHeight) {
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
            height: startHeight + i,
            extrinsics,
          });
        // avoid failed casued by some requests
        } catch (e) {
          return null;
        }
      })
  );

  console.log('Retrive Blocks From Node', blocks, endHeight, startHeight);

  // filter some failures
  return blocks.filter((block) => !!block) as Block[];
};

const retriveLatestBlocks = async (api: ApiRx, startIndex = 1): Promise<Block[]> => {
  const header = await api.rpc.chain.getHeader().toPromise();

  return retriveBlocks(api, header.number.toNumber(), startIndex);
};

export const BlocksProvider = React.memo((
  { children }: { children: React.ReactNode }): React.ReactElement => {
    const { api, isApiReady, systemName } = useContext(ApiContext);
    const [_blocks, setBlocks] = useState<Block[]>([]);
    const blocksRef = useRef<Block[]>([]);

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
          console.log('new header: ', header.number.toNumber(), header);

          const lastBlock = blocksRef.current[blocksRef.current.length - 1];

          const unSavedBlocks = await retriveBlocks(
            api,
            header.number.toNumber(),
            lastBlock ? lastBlock.height + 1 : 1,
          );

          blocksRef.current = [
            ...blocksRef.current,
            ...unSavedBlocks,
          ];
          setBlocks(blocksRef.current);
        }),
        () => {},
      );
    }, [api, isApiReady, systemName]);

    return <BlocksContext.Provider value={{
      blocks: _blocks
    }}>{children}</BlocksContext.Provider>;
  }
);

 