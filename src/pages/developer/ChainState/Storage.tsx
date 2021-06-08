import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { ApiRx } from '@polkadot/api';
import type { StorageEntry } from '@polkadot/types/primitive/types';
import { unwrapStorageType } from '@polkadot/types/primitive/StorageKey';
import styled from 'styled-components';
import { ApiContext } from '../../../core';
import { Sections } from './Sections';
import { Methods } from './Methods';
import AddSvg from '../../../assets/imgs/add.svg';
import { Col, Row } from 'antd';

const Wrapper = styled.div`
  padding: 20px;
`;
const Selection = styled.div`
  display: flex;

  > .selection {
    flex: 1;
  }
  > img {
    margin-left: 16px;
    width: 40px;
    height: 40px;
  }
`;


const createOptions = (api: ApiRx): string[] => {
  return Object
    .keys(api.consts)
    .sort()
    .filter((name): number => Object.keys(api.consts[name]).length);
}

export const Storage: FC = (): ReactElement => {
  const [ methods, setMethods ] = useState<string[]>([]);
  const [ section, setSection ] = useState<string>('');
  const [ method, setMethod ] = useState<string>('');
  const { api } = useContext(ApiContext);

  const onExec = useCallback(() => {

  }, []);

  const onSectionChange = useCallback((sectionName: string) => {
    console.log('aaa', sectionName, api.query[sectionName]);
    const section = api.query[sectionName];

    const methods = Object
      .keys(section)
      .sort()
      .map((value) => {
        const method = section[value] as unknown as StorageEntry;
        const type = method.meta.type;
        const input = type.isPlain
          ? ''
          : type.isMap
            ? type.asMap.key.toString()
            : type.isDoubleMap
              ? `${type.asDoubleMap.key1.toString()}, ${type.asDoubleMap.key2.toString()}`
              : type.asNMap.keyVec.map((k) => k.toString()).join(', ');
        const output = method.meta.modifier.isOptional
          ? `Option<${unwrapStorageType(type)}>`
          : unwrapStorageType(type);

        return value;
      });

    setSection(sectionName);
    setMethods(methods);
  }, [api.query]);

  return (
    <Wrapper>
      <Selection>
        <Row className="selection">
          <Col span={7}>
            <Sections options={createOptions(api)} onChange={onSectionChange} />
          </Col>
          <Col span={17}>
            <Methods options={methods} onChange={setMethod} />
          </Col>
        </Row>
        <img src={AddSvg} alt="" />
      </Selection>

    </Wrapper>
  );
};
