import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import { AbiMessage } from '@polkadot/api-contract/types';
import { ApiContext } from '../../core';
import UIParams from '../../react-params';
import MoreSvg from '../../assets/imgs/more.svg';
import LabeledInput from '../developer/shared/LabeledInput';
import { RawParams } from '../../react-params/types';

const Wrapper = styled.div`
`;
const { Option } = Select;

export const Constructor: FC<{
  defaultValue?: AbiMessage;
  abiMessages: AbiMessage[];
  onMessageChange: (message: AbiMessage) => void;
  onParamsChange: (params: RawParams) => void;
}> = ({ abiMessages, onMessageChange, onParamsChange, defaultValue }): ReactElement => {
  const [ message, setMessage ] = useState<AbiMessage | undefined>(defaultValue);
  const { api } = useContext(ApiContext);
  const _onMessageChange = useCallback(value => {
    const message = abiMessages.find(m => m.identifier === value)!;

    setMessage(message);
    onMessageChange(message);
  }, [abiMessages, onMessageChange]);

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
            onChange={onParamsChange}
            params={message.args}
            registry={api.registry}
          />
      }
    </Wrapper>
  );
};
