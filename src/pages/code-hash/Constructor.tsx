import { Abi } from '@polkadot/api-contract';
import { AbiMessage } from '@polkadot/api-contract/types';
import { Input, Select } from 'antd';
import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ApiContext } from '../../core/provider/api.provider';
import store from '../../core/store/store';

const Wrapper = styled.div`
`;
const { Option } = Select;

const StyledSelected = styled(Select)`
  width: 100%;
  /* height: 48px; */
`;


export const Constructor: FC<{ abiMessages: AbiMessage[] }> = ({ abiMessages }): ReactElement => {
  const { api } = useContext(ApiContext);
  const [ message, setMessage ] = useState<AbiMessage | undefined>(abiMessages[0]);
  const [ args, setArgs ] = useState<{ [key: string]: any }>({});

  console.log('abimessages', abiMessages);
  
  return (
    <Wrapper>
      <StyledSelected size="large" value={message?.identifier} onChange={value => setMessage(abiMessages.find(m => m.identifier === value))} >
        {
          abiMessages.map(message =>
            <Option value={message.identifier} key={message.identifier}>{message.method}</Option>
          )
        }
      </StyledSelected>
      {
        message?.args.map(arg =>
          <Input key={arg.name} placeholder={arg.name + ':' + arg.type.displayName} value={args[arg.name]} onChange={e => setArgs({...args, [arg.name]: e.target.value })} />
        )
      }
    </Wrapper>
  );
};
