import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { LabelDefault, TitleWithBottomBorder, contentBase, formatAddress, Style, ValueLine, Tabs } from '../../shared';
import { Deploy } from './Deploy';
import { Instances } from './Instances';
import { UploadAbi } from './UploadAbi';
import { BlocksContext, useContracts, ApiContext } from '../../core';

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

enum TabChoice {
  Codes = 'Codes',
  Instances = 'Instances',
}

export const CodeHash: FC = (): ReactElement => {
  const [ show, setShow ] = useState(false);
  const { codeHash } = useParams<{ codeHash: string }>();
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { codesHash } = useContracts(api, blocks);
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Codes);

  const choosedCode = useMemo(() => codesHash.find(code => code.hash === codeHash), [codesHash, codeHash]);

  return (
    <Wrapper>
      <TitleWithBottomBorder>
        <div className="label-line">
          <LabelDefault>Code Hash</LabelDefault>
          <LabelDefault>Uploader</LabelDefault>
        </div>
        <ValueLine>
          <div>{ codeHash }</div>
          <Uploader>
            <Link to={`/explorer/eoa/${choosedCode?.extrinsic.signer.toString()}`}>{ formatAddress(choosedCode?.extrinsic.signer.toString() || '') }</Link>
            <span>at</span>
            <Link to={`/explorer/block/${choosedCode?.block.blockHash}`}>{ formatAddress(choosedCode?.block.blockHash || '') }</Link>
          </Uploader>
        </ValueLine>
      </TitleWithBottomBorder>

      <TabTitle>
        <Tabs
          options={[
            { title: 'Codes', value: TabChoice.Codes },
            { title: 'Instances', value: TabChoice.Instances },
          ]}
          defaultValue={TabChoice.Codes}
          onChange={choice => setTabChoice(choice)}
        ></Tabs>
        <UploadButton onClick={() => setShow(true)}>Upload ABI</UploadButton>
      </TabTitle>

      {
        tabChoice === TabChoice.Codes &&
          <Deploy hash={codeHash} />
      }
      {
        tabChoice === TabChoice.Instances &&
          <Instances hash={codeHash} />
      }
      <UploadAbi show={show} onClose={() => setShow(false)} codeHash={codeHash} blockHeight={choosedCode?.block.height || 0} />
    </Wrapper>
  );
};
