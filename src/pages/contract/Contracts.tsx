import React, { FC, ReactElement, useContext, useState } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { UploadContract } from './Upload';
import { store, BlocksContext, ApiContext, useContracts } from '../../core';

const Wrapper = styled.div`
`;

export const Contracts: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts, codesHash } = useContracts(api, blocks);
  const [ showUpload, toggleUpload ] = useState(false);

  return (
    <Wrapper>
      <Button onClick={() => toggleUpload(true)}>Upload Contract</Button>
      <div>
        <h3>Contracts</h3>
        <div>
          {
            contracts.map(contract =>
              <div key={contract.address}>
                <span>
                  {store.getCode(contract.codeHash)?.json.name} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                </span>
                <Link to={`/explorer/contract/${contract.address}`}>
                  {contract.address}
                </Link>
                &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                <Link to={`/extrinsic/${contract.extrinsic.hash.toString()}/details`}>
                  {contract.extrinsic.hash.toString()}
                </Link>
                &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                {contract.block.height}
              </div>
            )
          }
        </div>
      </div>
      <div>
        <h3>Codes</h3>
        <div>
          {
            codesHash.map(code =>
              <div key={code.hash}>
                <span>
                  {store.getCode(code.hash)?.json.name} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                </span>
                <Link to={`/explorer/code-hash/${code.hash}`}>
                    {code.hash}
                </Link>
                &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                <Link to={`/extrinsic/${code.extrinsic.hash.toString()}/details`}>
                  {code.extrinsic.hash.toString()}
                </Link>
                &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
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
