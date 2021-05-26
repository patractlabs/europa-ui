import React, { FC, ReactElement, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MoreSvg from '../../assets/imgs/more.svg';
import { AbiMessage } from '@polkadot/api-contract/types';
import { Style } from '../../shared';
import { Button } from 'antd';
import { Param } from './Param';
import { AddressInput } from '../../shared/components/AddressInput';

const Wrapper = styled.div`
  background-color: ${Style.color.bg.default};
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0px;
  }
`;

const MessageSignature = styled.div`
  padding: 0px 20px;
  cursor: pointer;
  height: 52px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .message-id {
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    color: ${Style.color.label.primary};
    width: 70px;
  }
  
  .signature {
    font-size: 16px;
    color: ${Style.color.label.primary};
  }
`;
const Toggle = styled.img`
  width: 16px;
  height: 16px;
`;
const Exec = styled.div`
  margin-top: 20px;
`;

const Call = styled.div`
  border-top: 1px solid #DEDEDE;
  padding: 16px 20px;

`;
const Params = styled.div`
  width: 50%;
  min-width: 550px;
`;

const Caller = styled.div`

  > .caller {
    font-size: 16px;
    font-weight: bold;
    color: #2A292B;
    padding-bottom: 8px;
  }
`;

const Result = styled.div`

`;


export const Message: FC<{ message: AbiMessage; index: number }> = ({ message, index }): ReactElement => {
  const [ expanded, setExpanded ] = useState(false);
  const [ sender, setSender ] = useState<string>('');
  const [ params, setParams ] = useState<{ [key: string]: string}>({});

  const send = useCallback(() => {
    console.log('send', params, sender);
    
  }, [params, sender]);

  useEffect(() => {
    const params = message.args.reduce((p: { [key: string]: string}, arg) => {
      p[arg.name] = '';
      return p;
    }, {});
    setParams(params);
  }
  , [message]);

  return (
    <Wrapper>
      <MessageSignature onClick={() => setExpanded(!expanded)}>
        <div>
          <span className="message-id">{index}</span>
          <span className="signature">{message.method}</span>
        </div>
        <Toggle src={MoreSvg} alt="" style={{ transform: expanded ? 'scaleY(-1)' : '' }} />
      </MessageSignature>
      {
        expanded &&
          <Call>
            <Params>
              {
                message.args.map(arg =>
                  <Param key={arg.name} arg={arg} value={params[arg.name]} onChange={value => setParams({
                    ...params,
                    [arg.name]: value
                  })} />
                )
              }
              
              {
                message.isMutating &&
                  <Caller>
                    <div className="caller">Caller</div>
                    <AddressInput address={sender} onChange={setSender}/>
                  </Caller>
              }
            </Params>
            <Exec>
              <Button onClick={send}>{ message.isMutating ? 'Execute' : 'Read' }</Button>
            </Exec>
            <Result>
              <span className="type"></span>
              <span className="value"></span>
            </Result>
          </Call>
      }
    </Wrapper>
  );
};
