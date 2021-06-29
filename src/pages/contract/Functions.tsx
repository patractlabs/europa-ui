import { ContractRx } from '@polkadot/api-contract';
import React, { FC, useMemo, ReactElement, useContext, useState } from 'react';
import styled from 'styled-components';
import { useContracts, ApiContext, BlocksContext, useAbi } from '../../core';
import { Style } from '../../shared';
import { Message } from './Message';

const Wrapper = styled.div`
  padding: 20px;
  background-color: white;
`;

enum Section {
  Read = 'Read',
  Execute = 'Execute',
}
const TabsWrapper = styled.div`
  border: 1px solid ${Style.color.primary};
  height: 36px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;

  > div {
    text-align: center;
    width: 120px;
    font-size: 15px;
    font-weight: 600;
    color: ${Style.color.primary};
    cursor: pointer;
  }
  > .tab-choosed {
    height: 36px;
    line-height: 36px;
    color: #ffffff;
    background-color: ${Style.color.primary};
  }
  > .tab-choosed-left {
    border-radius: 9px 0px 0px 9px;
  }
  > .tab-choosed-right {
    border-radius: 0px 9px 9px 0px;
  }
`;

const Tabs: FC<{
  options: { name: string; value: string }[];
  defaultValue?: string;
  onChange: (value: any) => void;
  style?: React.CSSProperties;
}> = ({ options, defaultValue, onChange, style = {} }): ReactElement => {
  const [ choosed, setChoosed ] = useState<any>(defaultValue || options[0]?.value);

  return (
    <TabsWrapper style={style}>
      {
        options.map((option, index) =>
          <div
            key={option.value}
            className={ `${choosed === option.value ? 'tab-choosed' : ''} ${0 === index ? 'tab-choosed-left' : 'tab-choosed-right'}` }
            onClick={() => {
              setChoosed(option.value);

              if (choosed !== option.value) {
                onChange(option.value);
              }
            }}
          >
            <div>{ option.name }</div>
          </div>
        )
      }
    </TabsWrapper>
  );
};

export const Functions: FC<{ contractAddress: string }> = ({ contractAddress }): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const [ section, setSection ] = useState<Section>(Section.Read);
  const { abi } = useAbi(contracts.find(contract => contract.address === contractAddress)?.codeHash || '');

  const messages = useMemo(() =>
    abi?.messages.filter(message =>
      (!message.isMutating && section === Section.Read) || (message.isMutating && section === Section.Execute)
    ) || [],
    [abi, section]
  );

  const contract = useMemo(() => {
    if (!abi) {
      return;
    }
    return new ContractRx(api, abi, contractAddress);
  }, [api, abi, contractAddress]);

  return (
    <Wrapper>
      {
        (!abi || !contract) &&
          'Please upload ABI'
      }
      {
        abi && contract &&
          <div>
            <Tabs
              style={{ marginBottom: '20px' }}
              options={[
                { value: Section.Read, name: Section.Read, },
                { value: Section.Execute, name: Section.Execute, }
              ]}
              onChange={value => setSection(value)}
            />
            
            {
              messages.map((message, index) =>
                <Message key={message.identifier} contract={contract} message={message} index={index + 1} />
              )
            }
          </div>
      }
    </Wrapper>
  );
};
