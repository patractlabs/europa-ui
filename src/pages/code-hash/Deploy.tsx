import React, { FC, ReactElement, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { store } from '../../core';
import { Constructor } from './Constructor';
import { ParamInput, Style } from '../../shared';

const Wrapper = styled.div`
  background-color: white;
  display: flex;
  justify-content: center;
  padding: 60px 0px;
`;
const Form = styled.div`
  width: 480px;
  margin-bottom: 30px;
`;
const ButtonPrimary = styled.button`
  padding: 0px 38px;
  height: 40px;
  background: ${Style.color.button.primary};
  color: white;
  border-radius: 26px;
  border-width: 0px;
`;

export const Deploy: FC<{ hash: string, signal: number }> = ({ hash, signal }): ReactElement => {

  const abi = useMemo(() => {
    store.loadAll();
    return store.getCode(hash)?.contractAbi;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, signal]);

  const a = useCallback(e => console.log('asdfasdf', e), []);

  return (
    <Wrapper>
      {
        !abi ? 'Please upload the ABI first' :
          <div>
            <Form>
              <Constructor abiMessages={abi.constructors} onMessageChange={a} onParamsChange={a} />
              <ParamInput style={{ margin: '20px 0px' }} onChange={() => {} } label="Endowment" unit="DOT" />
              <ParamInput style={{ borderBottomWidth: '0px' }} onChange={() => {} } label="unique deployment salt" />
              <ParamInput onChange={() => {} } label="max gas allowed" />
            </Form>
            <div>
              <ButtonPrimary>Deploy</ButtonPrimary>
            </div>
          </div>
      }
    </Wrapper>
  );
};
