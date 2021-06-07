import { useEffect, useMemo, useState } from 'react';
import { Block, Extrinsic } from './../provider/blocks.provider';
import { of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';

export interface DeployedContract {
  codeHash: string;
  address: string;
  extrinsic: Extrinsic;
  block: Block;
}

export interface DeployedCode {
  hash: string;
  extrinsic: Extrinsic;
  block: Block;
}

export const useContracts = (api: ApiRx, blocks: Block[]) => {
  const [ codesHash, setCodesHash ] = useState<DeployedCode[]>([]);
  const [ contracts, setContracts ] = useState<DeployedContract[]>([]);

  useMemo(() => {
    const contracts: DeployedContract[] = [];

    blocks.forEach(block =>
      block.extrinsics.filter(extrinsic =>
        extrinsic.method.section === 'contracts'
          && (extrinsic.method.method === 'instantiate' || extrinsic.method.method === 'instantiateWithCode')
          && extrinsic.events.find(event => event.event.section === 'system' && event.event.method === 'ExtrinsicSuccess')
      ).forEach(extrinsic =>
        contracts.push({
          codeHash: '',
          address: extrinsic.events.find(event => event.event.section === 'contracts' && event.event.method === 'Instantiated')?.event.data[1].toString() || '',
          extrinsic,
          block,
        })
      )
    );

    return contracts;
  }, [blocks]);


  useEffect(() => {
    const _contracts: DeployedContract[] = [];

    blocks.forEach(block =>
      block.extrinsics.filter(extrinsic =>
        extrinsic.method.section === 'contracts'
          && (extrinsic.method.method === 'instantiate' || extrinsic.method.method === 'instantiateWithCode')
          && extrinsic.events.find(event => event.event.section === 'system' && event.event.method === 'ExtrinsicSuccess')
      ).forEach(extrinsic =>
        _contracts.push({
          codeHash: '',
          address: extrinsic.events.find(event => event.event.section === 'contracts' && event.event.method === 'Instantiated')?.event.data[1].toString() || '',
          extrinsic,
          block,
        })
      )
    );

    const sub = zip(
      ..._contracts.map(contract =>
        api.query.contracts.contractInfoOf(contract.address).pipe(
          map(info => {
            const alive = (info.toHuman() as { Alive: { codeHash: string } }).Alive || undefined;

            if (!alive) {
              return undefined;
            }

            return {
              hash: alive.codeHash,
              extrinsic: contract.extrinsic,
              block: contract.block,
            };
          }),
          catchError(_ => of(undefined)),
        )
      ),
    ).pipe(
      // map(codes => codes.filter(code => !!code) as DeployedCode[]),
    ).subscribe(codes => {
      const codesMap: { [key: string]: DeployedCode } = {};

      codes.forEach((code, index) =>{
        if (!code) {
          return;
        }
        _contracts[index].codeHash = code.hash;

        if (!codesMap[code.hash] || code.block.height < codesMap[code.hash].block.height) {
          codesMap[code.hash] = code;
        }
      });
      codes = Object.keys(codesMap).map(hash => codesMap[hash]).filter(code => !!code);
      setCodesHash(codes as DeployedCode[]);
      setContracts(_contracts);
    });

    return () => sub.unsubscribe();
  }, [blocks, api]);

  return {
    contracts,
    codesHash,
  };
};