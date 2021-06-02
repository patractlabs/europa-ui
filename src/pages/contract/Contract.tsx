import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { contentBase, formatAddress, LabelDefault, Style, Tabs, TitleWithBottomBorder, ValueLine } from '../../shared';
import { BlocksContext, ApiContext, useContracts, useBalance } from '../../core';
import { Functions } from './Functions';
import { ContractExtrinsics } from './ContractExtrinsics';
import { ContractEvents } from './ContractEvents';

const Wrapper = styled.div`
  ${contentBase}
`;
const Content = styled.div`
  margin-top: 20px;
`;
const Uploader = styled.div`
  >span {
    margin: 0px 5px;
    color: ${Style.color.label.primary};
  }
`;

enum TabChoice {
  Functions = 'Functions',
  Extrinsics = 'Extrinsics',
  Events = 'Events',
}

export const Contract: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const { address } = useParams<{ address: string }>();
  const { balance } = useBalance(api, address);
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Functions);
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
          <div>{ balance?.toString() } DOT</div>
        </ValueLine>
      </TitleWithBottomBorder>
      <Content>
        <Tabs
          options={[
            { name: 'Functions', value: TabChoice.Functions },
            { name: 'Extrinsics', value: TabChoice.Extrinsics },
            { name: 'Events', value: TabChoice.Events },
          ]}
          defaultValue={TabChoice.Functions}
          onChange={choice => setTabChoice(choice)}
        ></Tabs>
      </Content>
      <Functions show={tabChoice === TabChoice.Functions} contractAddress={address} />
      <ContractExtrinsics show={tabChoice === TabChoice.Extrinsics} contractAddress={address} />
      <ContractEvents show={tabChoice === TabChoice.Events} contractAddress={address} />
    </Wrapper>
  );
};
