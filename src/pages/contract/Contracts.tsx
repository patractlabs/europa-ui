import React, { FC, ReactElement, useContext, useState } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { BlocksContext } from '../../core/provider/blocks.provider';
import { UploadContract } from './Upload';
import { ApiContext } from '../../core/provider/api.provider';
import { Link } from 'react-router-dom';
import { useContracts } from '../../core/hook/useContracts';

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
