import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Col, Row } from 'antd';
import styled from 'styled-components';
import { ApiRx } from '@polkadot/api';
import { ApiContext } from '../../../core';
import Sections from './Sections';
import Methods from './Methods';
import AddSvg from '../../../assets/imgs/add.svg';
import type { ConstantCodec } from '@polkadot/metadata/decorate/types';
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

const createOptions = (api: ApiRx): string[] => {
  return Object
    .keys(api.consts)
    .sort()
    .filter((name): number => Object.keys(api.consts[name]).length)
}

const createMethods = (api: ApiRx, sectionName: string) => {
  const section = api.consts[sectionName];

  if (!section || Object.keys(section).length === 0) {
    return [];
  }


  return Object
    .keys(section)
    .sort()
    .map(value => {
      const method = (section[value] as ConstantCodec);

      return {
        key: `${sectionName}_${value}`,
        label: `${value}: ${method.meta.type.toString()}`,
        value,
        desc: method.meta.documentation.join(''),
      };
    });
}

export const Constants: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const [ section, setSection ] = useState<string>(createOptions(api)[0]);
  const [ methods, setMethods ] = useState<{
    value: string;
    label: string;
    desc: string;
  }[]>(createMethods(api, section));
  const [ method, setMethod ] = useState<{
    value: string;
    label: string;
    desc: string;
  }>(methods[0]);
  const [results, setResults] = useState<any[]>([]);

  const onExec = useCallback(async () => {
    const result = api.consts[section][method.value];
    
    setResults(pre => ([result.toHuman(), ...pre]));

  }, [section, method, api.consts]);

  const onSectionChange = useCallback((sectionName: string) => {
    const methods = createMethods(api, sectionName);
   
    setSection(sectionName);
    setMethods(methods);
    setMethod(methods[0]);
  }, [api]);

  const onMethodChange = useCallback((method: {
    value: string;
    label: string;
    desc: string;
  }) => {
    setMethod(method);
  }, []);

  return (
    <Wrapper>
      <Input>
        <div className="selection">
          <Row>
            <Col span={7}>
              <Sections defaultValue={section} options={createOptions(api)} onChange={onSectionChange} />
            </Col>
            <Col span={17}>
              <Methods value={method} options={methods} onChange={onMethodChange} />
            </Col>
          </Row>
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
