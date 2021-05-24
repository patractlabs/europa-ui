import React, { FC, ReactElement, useCallback, useContext, useMemo, useState } from 'react';
import { Button, Input, message, Modal, Select } from 'antd';
import { Abi } from '@polkadot/api-contract';
import { ApiContext } from '../../core/provider/api.provider';
import type { RcFile } from 'antd/lib/upload';
import { hexToU8a, isHex, isWasm, u8aToString } from '@polkadot/util';
import { useAccounts } from '../../core/hook/useAccounts';
import { CodeRx } from '@polkadot/api-contract';
import store from '../../core/store/store';
import keyring from '@polkadot/ui-keyring';
import { handleTxResults } from '../../core/handle-result';
import type { Weight } from '@polkadot/types/interfaces';
import BN from 'bn.js';
import { randomAsHex } from '@polkadot/util-crypto';
import styled from 'styled-components';
import { TitleWithBottomBorder } from '../../shared/styled/TitleWithBottom';
import { LabelDefault } from '../../shared/styled/LabelDefault';
import { useParams } from 'react-router';
import { contentBase, formatAddress, Style, ValueLine } from '../../shared';
import { Link } from 'react-router-dom';
import { BlocksContext } from '../../core/provider/blocks.provider';
import { useContracts } from '../../core/hook/useContracts';
import { Deploy } from './Deploy';
import { Instances } from './Instances';
import { UploadAbi } from './UploadAbi';

const Wrapper = styled.div`
  ${contentBase}
`;
const Uploader = styled.div`
  >span {
    margin: 0px 5px;
    color: ${Style.color.label.primary};
  }
`;
const TabTitle = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const TabChoices = styled.div`
  display: flex;

  >.tab-choosed {
    color: ${Style.color.primary};
    background-color: white;
  }

`;
const TabChoice = styled.div`
  cursor: pointer;
  padding: 0px 32px;
  text-align: center;
  line-height: 48px;
  height: 48px;
  background: #EEECE9;
  border-radius: 8px 8px 0px 0px;
  font-size: 16px;
  color: ${Style.color.label.primary};
`;
const UploadButton = styled(Button)`
  padding: 0px 24px;
  height: 40px;
  border-radius: 26px;
  border: 1px solid #BEAC92;
  font-size: 14px;
  font-weight: bold;
  color: ${Style.color.primary};

  &:hover {
    color: ${Style.color.primary};
    border: 1px solid #BEAC92;
  }
`;


enum TabChoosed {
  deploy = 'deploy',
  instances = 'instances',
}

export const CodeHash: FC = (): ReactElement => {
  const [ show, setShow ] = useState(false);
  const { codeHash } = useParams<{ codeHash: string; }>();
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { codesHash } = useContracts(api, blocks);
  const [ tabChoosed, setTabChoosed ] = useState<TabChoosed>(TabChoosed.deploy);

  const choosedCode = useMemo(() => codesHash.find(code => code.hash === codeHash), [codesHash, codeHash]);

  return (
    <Wrapper>
      <TitleWithBottomBorder>
        <div className="label-line">
          <LabelDefault>Code Hash</LabelDefault>
          <LabelDefault>Uploader</LabelDefault>
        </div>
        <ValueLine>
          <ValueLine>{ codeHash }</ValueLine>
          <Uploader>
            <Link to={`/explorer/eoa/${choosedCode?.extrinsic.signer.toString()}`}>{ formatAddress(choosedCode?.extrinsic.signer.toString() || '') }</Link>
            <span>at</span>
            <Link to={`/explorer/block/${choosedCode?.block.blockHash}`}>{ formatAddress(choosedCode?.block.blockHash || '') }</Link>
          </Uploader>
        </ValueLine>
      </TitleWithBottomBorder>

      <TabTitle>
        <TabChoices>
          <TabChoice
            className={ tabChoosed === TabChoosed.deploy ? 'tab-choosed' : '' }
            onClick={() => setTabChoosed(TabChoosed.deploy)}
          >Codes</TabChoice>
          <TabChoice
            className={ tabChoosed === TabChoosed.instances ? 'tab-choosed' : '' }
            onClick={() => setTabChoosed(TabChoosed.instances)}
          >Instances</TabChoice>
        </TabChoices>
        <UploadButton onClick={() => setShow(true)}>Upload ABI</UploadButton>
      </TabTitle>

      {
        tabChoosed === TabChoosed.deploy &&
          <Deploy hash={codeHash} />
      }
      {
        tabChoosed === TabChoosed.instances &&
          <Instances hash={codeHash} />
      }
      <UploadAbi show={show} onClose={() => setShow(false)} codeHash={codeHash} blockHeight={choosedCode?.block.height || 0} />
    </Wrapper>
  );
};
