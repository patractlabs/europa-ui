import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { contentBase, formatAddress, LabelDefault, Style, Tabs, TitleWithBottomBorder, ValueLine } from '../../shared';
import { BlocksContext, ApiContext, useContracts, useBalance } from '../../core';

const Wrapper = styled.div`
  ${contentBase}
`;
const Uploader = styled.div`
  >span {
    margin: 0px 5px;
    color: ${Style.color.label.primary};
  }
`;

export const Contract: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const { address } = useParams<{ address: string }>();
  const { balance } = useBalance(api, address);

  const choosedCode = useMemo(() => contracts.find(contract => contract.address === address), [contracts, address]);

  return (
    <Wrapper>
      <TitleWithBottomBorder>
        <div className="label-line">
          <LabelDefault>Address</LabelDefault>
          <LabelDefault>Creator</LabelDefault>
          <LabelDefault>Balance</LabelDefault>
        </div>
        <ValueLine>
          <div>{ address }</div>
          <Uploader>
            <Link to={`/explorer/eoa/${choosedCode?.extrinsic.signer.toString()}`}>{ formatAddress(choosedCode?.extrinsic.signer.toString() || '') }</Link>
            <span>at</span>
            <Link to={`/explorer/block/${choosedCode?.block.blockHash}`}>{ formatAddress(choosedCode?.block.blockHash || '') }</Link>
          </Uploader>
          <div>{ balance } DOT</div>
        </ValueLine>
      </TitleWithBottomBorder>
      <div>
        <Tabs options={[
          { title: 'Functions', value: 'Functions' },
          { title: 'Extrinsics', value: 'Extrinsics' },
          { title: 'Events', value: 'Events' },
        ]} onChange={() => {}} ></Tabs>
      </div>

    </Wrapper>
  );
};
