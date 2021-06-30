import React, { FC, useMemo, ReactElement, useCallback, useContext, useState } from 'react';
import { Col, Row } from 'antd';
import styled from 'styled-components';
import type { DefinitionRpcExt, Codec } from '@polkadot/types/types';
import { ApiRx } from '@polkadot/api';
import { getTypeDef } from '@polkadot/types';
import { useRpcs, ApiContext } from '../../../core';
import Sections from '../ChainState/Sections';
import Methods from '../ChainState/Methods';
import AddSvg from '../../../assets/imgs/add.svg';
import { ParamDef, RawParamOnChangeValue } from '../../../react-params/types';
import Params from '../../../react-params';

const Wrapper = styled.div`
  padding: 20px;
`;
const Input = styled.div`
  display: flex;

  > .selection {
    flex: 1;
  }
  > img {
    cursor: pointer;
    margin-left: 16px;
    width: 40px;
    height: 40px;
  }   
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


const createOptions = (api: ApiRx) => {
  return Object
    .keys(api.rpc)
    .sort()
    .filter((section) => Object.keys((api.rpc as Record<string, Record<string, unknown>>)[section]).length !== 0)
}

const createMethods = (api: ApiRx, rpcs: Record<string, Record<string, DefinitionRpcExt>>, sectionName: string) => {
  const section = rpcs[sectionName];

  if (!section || Object.keys((api.rpc as Record<string, Record<string, unknown>>)[sectionName]).length === 0) {
    return [];
  }

  return Object
    .keys((api.rpc as Record<string, Record<string, unknown>>)[sectionName])
    .sort()
    .map((methodName) => section[methodName])
    .filter((ext): ext is DefinitionRpcExt => !!ext)
    .filter(({ isSubscription }) => !isSubscription)
    .map(({ description, method, params }) => {
      const inputs = params.map(({ name }) => name).join(', ');

      return {
        label: `${method}(${inputs})`,
        desc: `${description || method}`,
        value: method,
      };
    });
};

export const RpcCall: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const rpcs = useRpcs();
  const [ section, setSection ] = useState<string>(createOptions(api)[0]);
  const [ methods, setMethods ] = useState<{
    value: string;
    label: string;
    desc: string;
  }[]>(createMethods(api, rpcs, section));
  const [ method, setMethod ] = useState<{
    value: string;
    label: string;
    desc: string;
  }>(methods[0]);
  const [paramValues, setParamValues] = useState<RawParamOnChangeValue[]>([]);
  const params = useMemo(
    () => rpcs[section][method.value].params.map(({ isOptional, name, type }): ParamDef => ({
      name,
      type: getTypeDef(isOptional ? `Option<${type}>` : type)
    })),
    [section, method, rpcs]
  );

  const [results, setResults] = useState<any[]>([]);

  const onExec = useCallback(async () => {
    const exec = (api.rpc as any)[section][method.value];

    exec(...(paramValues.map(p => p.value) as any[])).subscribe(
      (result: Codec) => setResults(pre => ([result.toHuman(), ...pre])),
      (err: any) => setResults(pre => ([err.toString(), ...pre])),
    );
  }, [paramValues, section, method, api.rpc]);

  const onSectionChange = useCallback((sectionName: string) => {
    const methods = createMethods(api, rpcs, sectionName);
   
    setSection(sectionName);
    setMethods(methods);
    setMethod(methods[0]);
  }, [api, rpcs]);

  return (
    <Wrapper>
      <Input>
        <div className="selection">
          <Row>
            <Col span={7}>
              <Sections defaultValue={section} options={createOptions(api)} onChange={onSectionChange} />
            </Col>
            <Col span={17}>
              <Methods value={method} options={methods} onChange={setMethod} />
            </Col>
          </Row>
          
          <Params
            onChange={setParamValues}
            params={params}
          />
        </div>
        <img onClick={onExec} src={AddSvg} alt="" />
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
