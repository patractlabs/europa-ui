import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import { AbiMessage } from '@polkadot/api-contract/types';
import { ApiContext } from '../../core';
import UIParams from '../../react-params';
import MoreSvg from '../../assets/imgs/more.svg';
import LabeledInput from '../developer/shared/LabeledInput';

const Wrapper = styled.div`
`;
const { Option } = Select;

export const Constructor: FC<{
  defaultValue?: AbiMessage; 
  abiMessages: AbiMessage[];
  onMessageChange: (message: AbiMessage) => void;
  onParamsChange: (params: any[]) => void;
}> = ({ abiMessages, onMessageChange, onParamsChange, defaultValue }): ReactElement => {
  const [ message, setMessage ] = useState<AbiMessage | undefined>(defaultValue);
  const { api } = useContext(ApiContext);
  const _onMessageChange = useCallback(value => {
    const message = abiMessages.find(m => m.identifier === value)!;
    const args = message.args.reduce((args: { [key: string]: any }, arg) => {
      args[arg.name] = null;
      return args;
    }, {});

    setMessage(message);
    onMessageChange(message);
    onParamsChange(Object.keys(args).map(key => args[key]));
  }, [abiMessages, onMessageChange, onParamsChange]);

  return (
    <Wrapper>
      <LabeledInput style={{ marginBottom: '16px' }}>
        <div className="span">deployment constructor</div>
        <Select
          value={message?.identifier}
          bordered={false}
          suffixIcon={<img src={MoreSvg} alt="" />}
          onChange={_onMessageChange}
        >
          {
            abiMessages.map(message =>
              <Option value={message.identifier} key={message.identifier}>{message.method}({
                message.args.map((arg, index) =>
                  `${index ? ', ' : ''}${arg.name}: ${arg.type.displayName}`
                )
              })</Option>
            )
          }
        </Select>
      </LabeledInput>
      
      {
        !!message &&
          <UIParams
            onChange={value => onParamsChange(value.map(v => v.value))}
            params={message.args}
            registry={api.registry}
          />
      }
    </Wrapper>
  );
};
