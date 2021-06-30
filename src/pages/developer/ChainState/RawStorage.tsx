import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Input as AntInput } from 'antd';
import styled from 'styled-components';
import AddSvg from '../../../assets/imgs/add.svg';
import { ApiContext } from '../../../core';
import Input from '../shared/Input';
import { Style } from '../../../shared';
import Result from '../shared/Result';

const Wrapper = styled.div`
  padding: 20px;
  flex: 1;
  background-color: white;
`;

const StyledInput = styled(AntInput)`
  height: 48px;
  border: 1px solid ${Style.color.border.default};
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
      <Result
        results={results}
        onDelete={index  =>
          setResults([...results.slice(0, index), ...results.slice(index + 1)])
        }
      />
    </Wrapper>
  );
};
