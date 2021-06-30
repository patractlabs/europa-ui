import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Input as AntInput } from 'antd';
import styled from 'styled-components';
import AddSvg from '../../../assets/imgs/add.svg';
import { ApiContext } from '../../../core';
import Input from '../shared/Input';

const Wrapper = styled.div`
  padding: 20px;
`;

const Result = styled.div`
   margin-top: 10px;
  display: flex;

  > .info {
    flex: 1;
  }
  > img {
    cursor: pointer;
    margin-left: 16px;
    width: 40px;
    height: 40px;
  }   
`;

const StyledInput = styled(AntInput)`
  height: 48px;
  border-width: 0px;
  box-shadow: none;
  outline: none;

  &:focus {
    box-shadow: none;
  }
`;

export const RawStorage: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const [ key, setKey ] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);

  const onExec = useCallback(async () => {
    api.rpc.state.subscribeStorage([key]).subscribe(result =>
      setResults(pre => ([result, ...pre]))
    );
  }, [key, api]);

  return (
    <Wrapper>
      <Input>
        <div className="selection">
          <StyledInput onChange={e => setKey(e.target.value)} />
        </div>
        <div className="button">
          <img onClick={onExec} src={AddSvg} alt="" />
        </div>
      </Input>
      {
        results.map((result, index) =>
          <Result key={index}>
            <div className="info">
              {JSON.stringify(result)}
            </div>
            <img onClick={() =>
              setResults([...results.slice(0, index), ...results.slice(index + 1)])
            } src={AddSvg} alt="" />
          </Result>
        )
      }
    </Wrapper>
  );
};
