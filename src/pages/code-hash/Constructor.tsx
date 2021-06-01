import React, { FC, ReactElement, useCallback, useContext, useRef, useState } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import { AbiMessage } from '@polkadot/api-contract/types';
import { ApiContext } from '../../core';
import Param from '../../react-params/Param';

const Wrapper = styled.div`
`;
const { Option } = Select;

const StyledSelected = styled(Select)`
  width: 100%;
  height: 48px;
  > .ant-select-selector {
    height: 48px;
  }
`;

export const Constructor: FC<{
  abiMessages: AbiMessage[];
  onMessageChange: (message: AbiMessage) => void;
  onParamsChange: (params: any[]) => void;
}> = ({ abiMessages, onMessageChange, onParamsChange }): ReactElement => {
  const [ message, setMessage ] = useState<AbiMessage>(abiMessages[0]);
  const { api } = useContext(ApiContext);
  const _args = useRef<{ [key: string]: any }>(abiMessages[0].args.reduce((args: { [key: string]: any }, arg) => {
    args[arg.name] = null;
    return args;
  }, {}));

  const _onMessageChange = useCallback(value => {
    const message = abiMessages.find(m => m.identifier === value)!;
    const args = message.args.reduce((args: { [key: string]: any }, arg) => {
      args[arg.name] = null;
      return args;
    }, {});

    _args.current = args;
    setMessage(message);
    onMessageChange(message);
    onParamsChange(Object.keys(args).map(key => args[key]));
  }, [abiMessages, onParamsChange, onMessageChange]);

  return (
    <Wrapper>
      <StyledSelected size="large" value={message?.identifier} onChange={_onMessageChange} >
        {
          abiMessages.map(message =>
            <Option value={message.identifier} key={message.identifier}>{message.method}({
              message.args.map((arg, index) =>
                `${index ? ', ' : ''}${arg.name}: ${arg.type.displayName}`
              )
            })</Option>
          )
        }
      </StyledSelected>
      {
        message?.args.map(arg =>
          <Param
            key={arg.name}
            registry={api.registry}
            type={arg.type}
            defaultValue={{ isValid: true, value: undefined }}
            onChange={value => {
              const newArgs = {..._args.current, [arg.name]: value.value };
          
              _args.current = newArgs;
              onParamsChange(Object.keys(newArgs).map(key => _args.current[key]))
            }}
          />
        )
      }
    </Wrapper>
  );
};
