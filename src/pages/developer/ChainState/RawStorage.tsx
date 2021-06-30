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

  
  .selection {
    > .storage-key {
      border: 1px solid ${Style.color.border.default};
      height: 48px;
      padding: 4px 16px;
      > .span {
        height: 16px;
        font-size: 12px;
        color: #8c8b8c;
        line-height: 16px;
      }
      > .ant-input {
        padding-left: 0px;
        height: 24px;
        border: none;
        box-shadow: none;
        outline: none;
      }
      > .ant-input:focus {
      }
    }
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
          <div className="storage-key">
            <div className="span">
              hex-encoded storage key
            </div>
            <AntInput onChange={e => setKey(e.target.value)} />
          </div>
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
