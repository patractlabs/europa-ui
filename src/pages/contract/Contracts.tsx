import React, { FC, ReactElement, useContext, useState } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { UploadContract } from './Upload';
import { BlocksContext, ApiContext, useContracts } from '../../core';

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
        contracts
        <div>
          {
            contracts.map(contract =>
              <div key={contract.address}>
                <Link to={`/explorer/contract/${contract.address}`}>
                  {contract.address} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                </Link>
                <Link to={`/extrinsic/${contract.extrinsic.hash.toString()}/details`}>
                  {contract.extrinsic.hash.toString()} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                </Link>
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
                <Link to={`/explorer/code-hash/${code.hash}`}>
                  {code.hash} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                </Link>
                <Link to={`/extrinsic/${code.extrinsic.hash.toString()}/details`}>
                  {code.extrinsic.hash.toString()} &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                </Link>
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
