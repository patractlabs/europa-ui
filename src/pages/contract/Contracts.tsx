import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { Block, BlocksContext, Extrinsic } from '../../core/provider/blocks.provider';
import { UploadContract } from './Upload';
import { of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiContext } from '../../core/provider/api.provider';

const Wrapper = styled.div`
`;

interface DeployedContract {
  address: string;
  extrinsic: Extrinsic;
  block: Block;
}

interface DeployedCode {
  hash: string;
  extrinsic: Extrinsic;
  block: Block;
}

export const Contracts: FC = (): ReactElement => {
  const [ showUpload, toggleUpload ] = useState(false);
  const { blocks } = useContext(BlocksContext);
  const { api } = useContext(ApiContext);
  const [ codesHash, setCodesHash ] = useState<DeployedCode[]>([]);

  const contracts: DeployedContract[] = useMemo(() => {
    const contracts: DeployedContract[] = [];

    blocks.forEach(block =>
      block.extrinsics.filter(extrinsic =>
        extrinsic.method.section === 'contracts'
          && (extrinsic.method.method === 'instantiate' || extrinsic.method.method === 'instantiateWithCode')
          && extrinsic.events.find(event => event.event.section === 'system' && event.event.method === 'ExtrinsicSuccess')
      ).forEach(extrinsic =>
        contracts.push({
          address: extrinsic.events.find(event => event.event.section === 'contracts' && event.event.method === 'Instantiated')?.event.data[1].toString() || '',
          extrinsic,
          block,
        })
      )
    );

    return contracts;
  }, [blocks]);

  useEffect(() => {
    const sub = zip(
      ...contracts.map(contract =>
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
      map(codes => codes.filter(code => !!code) as DeployedCode[]),
    ).subscribe(codes => {
      const codesMap: { [key: string]: DeployedCode } = {};

      codes.forEach(code =>{
        if (!codesMap[code.hash] || code.block.height < codesMap[code.hash].block.height) {
          codesMap[code.hash] = code;
        }
      });
      codes = Object.keys(codesMap).map(hash => codesMap[hash]);
      setCodesHash(codes);
    });

    return () => sub.unsubscribe();
  }, [contracts, api]);

  return (
    <Wrapper>
      <Button onClick={() => toggleUpload(true)}>Upload Contract</Button>
      <div>
        contracts
        <div>
          {
            contracts.map(contract =>
              <div key={contract.address}>
                {contract.address} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                {contract.extrinsic.hash.toString()} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                {contract.block.height}
              </div>
            )
          }
        </div>
      </div>
      <div>
        codes
        <div>
          {
            codesHash.map(code =>
              <div key={code.hash}>
                {code.hash} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                {code.extrinsic.hash.toString()} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                {code.block.height}
              </div>
            )
          }
        </div>
      </div>
      <UploadContract onCancel={() => toggleUpload(false)} onCompleted={() => toggleUpload(false)} show={showUpload} />
    </Wrapper>
  );
};
