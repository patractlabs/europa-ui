import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { contentBase, formatAddress, Style, Tabs, InfoHeader } from '../../shared';
import { Deploy } from './Deploy';
import { Instances } from './Instances';
import { UploadAbi } from './UploadAbi';
import { BlocksContext, useContracts, ApiContext, PaginationProvider } from '../../core';

const Wrapper = styled.div`
  ${contentBase}
`;
const Uploader = styled.div`
  font-size: 16px;
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
  border: 1px solid ${Style.color.button.primary};
  font-size: 14px;
  font-weight: bold;
  color: ${Style.color.primary};

  &:hover {
    color: ${Style.color.primary};
    border: 1px solid ${Style.color.button.primary};
  }
`;

enum TabChoice {
  Codes = 'Codes',
  Instances = 'Instances',
}

export const CodeHash: FC = (): ReactElement => {
  const [ show, setShow ] = useState(false);
  const [ signal, updateSignal ] = useState(0);
  const { codeHash } = useParams<{ codeHash: string }>();
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { codesHash } = useContracts(api, blocks);
  const [ tabChoice, setTabChoice ] = useState<TabChoice>(TabChoice.Codes);

  const choosedCode = useMemo(() => codesHash.find(code => code.hash === codeHash), [codesHash, codeHash]);

  return (
    <Wrapper>
      <InfoHeader pairs={
        [
          {
            label: 'Code Hash',
            render: <span style={{ fontSize: '16px', color: Style.color.label.primary }}>{codeHash}</span>
          },
          {
            label: 'Uploader',
            align: 'right',
            render:
              <Uploader>
                <Link to={`/explorer/eoa/${choosedCode?.extrinsic.signer.toString()}`}>{ formatAddress(choosedCode?.extrinsic.signer.toString() || '') }</Link>
                <span>at</span>
                <Link to={`/block/${choosedCode?.block.blockHash}`}>{ formatAddress(choosedCode?.block.blockHash || '') }</Link>
              </Uploader>
          },
        ]
      }/>

      <TabTitle>
        <Tabs
          options={[
            { name: 'Codes', value: TabChoice.Codes },
            { name: 'Instances', value: TabChoice.Instances },
          ]}
          defaultValue={TabChoice.Codes}
          onChange={choice => setTabChoice(choice)}
        ></Tabs>
        <UploadButton onClick={() => setShow(true)}>Upload ABI</UploadButton>
      </TabTitle>

      {
        tabChoice === TabChoice.Codes &&
          <Deploy signal={signal} hash={codeHash} />
      }
      {
        tabChoice === TabChoice.Instances &&
          <PaginationProvider>
            <Instances hash={codeHash} />
          </PaginationProvider>
      }
      <UploadAbi show={show} onCanceled={() => setShow(false)} onCompleted={() => { updateSignal(signal + 1); setShow(false)}} codeHash={codeHash} blockHeight={choosedCode?.block.height || 0} />
    </Wrapper>
  );
};
