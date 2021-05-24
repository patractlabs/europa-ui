import { Abi } from '@polkadot/api-contract';
import { AbiMessage } from '@polkadot/api-contract/types';
import { Select } from 'antd';
import { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
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

  return (
    <Wrapper>
      <StyledSelected size="large" value={message?.identifier} onChange={value => setMessage(abiMessages.find(m => m.identifier === value))} >
        {
          abiMessages.map(message =>
            <Option value={message.identifier} key={message.identifier}>{message.method}</Option>
          )
        }
      </StyledSelected>
    </Wrapper>
  );
};
