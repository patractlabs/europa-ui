import React, {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Col, Row } from 'antd';
import styled from 'styled-components';
import { getSiName } from '@polkadot/types/metadata/util';
import type { StorageEntry } from '@polkadot/types/primitive/types';
import type { QueryableStorageEntry } from '@polkadot/api/types';
import type {
  SiLookupTypeId,
  StorageEntryTypeLatest,
} from '@polkadot/types/interfaces';
import { Registry, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { ApiRx } from '@polkadot/api';
import { unwrapStorageType } from '@polkadot/types/primitive/StorageKey';
import { getTypeDef } from '@polkadot/types';
import { ApiContext } from '../../../core';
import Sections from '../shared/Sections';
import Methods from '../shared/Methods';
import AddSvg from '../../../assets/imgs/add.svg';
import { RawParamOnChangeValue, RawParams } from '../../../react-params/types';
import Params from '../../../react-params';
import Input from '../shared/Input';
import Result from '../shared/Result';

const Wrapper = styled.div`
  padding: 20px;
  flex: 1;
  background-color: white;
`;

interface TypeDefExt extends TypeDef {
  withOptionActive?: boolean;
}

type ParamsType = { type: TypeDefExt }[];

interface KeyState {
  defaultValues: RawParams | undefined | null;
  isIterable: boolean;
  key: QueryableStorageEntry<'rxjs'>;
  params: ParamsType;
}

const createOptions = (api: ApiRx): string[] => {
  return Object.keys(api.query)
    .sort()
    .filter((name): number => Object.keys(api.query[name]).length);
};

function expandSiKey(registry: Registry, key: SiLookupTypeId): string {
  const typeDef = registry.lookup.getTypeDef(key);

  return typeDef.lookupName || typeDef.type;
}

function expandParams(
  registry: Registry,
  st: StorageEntryTypeLatest,
  isIterable: boolean
): ParamsType {
  let types: string[] = [];

  if (st.isMap) {
    const { hashers, key } = st.asMap;

    types =
      hashers.length === 1
        ? [expandSiKey(registry, key)]
        : registry.lookup
            .getSiType(key)
            .def.asTuple.map(k => expandSiKey(registry, k));
  }

  return types.map((str, index) => {
    let type: TypeDefExt;

    if (isIterable && index === types.length - 1) {
      type = getTypeDef(`Option<${str}>`);
      type.withOptionActive = true;
    } else {
      type = getTypeDef(str);
    }

    return { type };
  });
}

function checkIterable(
  registry: Registry,
  type: StorageEntryTypeLatest
): boolean {
  // in the case of Option<type> keys, we don't allow map iteration, in this case
  // we would have option for the iterable and then option for the key value
  if (type.isPlain) {
    return true;
  }

  const { hashers, key } = type.asMap;

  if (hashers.length === 1) {
    return registry.lookup.getTypeDef(key).info !== TypeDefInfo.Option;
  }

  const keys = registry.lookup.getSiType(key).def.asTuple;

  return (
    registry.lookup.getTypeDef(keys[keys.length - 1]).info !==
    TypeDefInfo.Option
  );
}

function expandKey(api: ApiRx, sectionName: string, method: string): KeyState {
  const key = api.query[sectionName][method];
  const {
    creator: {
      meta: { type },
      section,
    },
  } = key;
  const isIterable = checkIterable(api.registry, type);

  return {
    defaultValues:
      section === 'session' && type.isMap
        ? [{ isValid: true, value: api.consts.session.dedupKeyPrefix.toHex() }]
        : null,
    isIterable,
    key,
    params: expandParams(api.registry, type, isIterable),
  };
}

const createMethods = (api: ApiRx, sectionName: string) => {
  const section = api.query[sectionName];

  return Object.keys(section)
    .sort()
    .map(value => {
      const method = section[value] as unknown as StorageEntry;
      const {
        meta: { docs, modifier, type },
      } = method;
      const output = unwrapStorageType(api.registry, type, modifier.isOptional);
      let input = '';

      if (type.isMap) {
        const { hashers, key } = type.asMap;

        if (hashers.length === 1) {
          input = getSiName(api.registry.lookup, key);
        } else {
          const si = api.registry.lookup.getSiType(key).def;

          if (si.isTuple) {
            input = si.asTuple
              .map(t => getSiName(api.registry.lookup, t))
              .join(', ');
          } else {
            input = si.asHistoricMetaCompat.toString();
          }
        }
      }

      return {
        value,
        label: `${value} (${input}): ${output}`,
        desc: docs.join(' '),
      };
    });
};

export const Storage: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const [section, setSection] = useState<string>(createOptions(api)[0]);
  const [methods, setMethods] = useState<
    {
      value: string;
      label: string;
      desc: string;
    }[]
  >(createMethods(api, section));
  const [method, setMethod] = useState<{
    value: string;
    label: string;
    desc: string;
  }>(methods[0]);
  const [paramValues, setParamValues] = useState<RawParamOnChangeValue[]>([]);
  const [params, setParams] = useState<ParamsType>(
    expandKey(api, section, method.value).params
  );
  const [results, setResults] = useState<any[]>([]);

  const onExec = useCallback(async () => {
    const query = api.query[section][method.value];

    query(...(paramValues.map(p => p.value) as any[])).subscribe(
      result => setResults(pre => [result.toHuman(), ...pre]),
      (err: any) => setResults(pre => [err.toString(), ...pre])
    );
  }, [paramValues, section, method, api.query]);

  const onSectionChange = useCallback(
    (sectionName: string) => {
      const methods = createMethods(api, sectionName);

      setSection(sectionName);
      setMethods(methods);
      setMethod(methods[0]);
      setParams(expandKey(api, sectionName, methods[0].value).params);
    },
    [api]
  );

  const onMethodChange = useCallback(
    (method: { value: string; label: string; desc: string }) => {
      setMethod(method);
      setParams(expandKey(api, section, method.value).params);
    },
    [api, section]
  );

  return (
    <Wrapper>
      <Input>
        <div className='selection'>
          <Row>
            <Col span={7}>
              <Sections
                span={'selected state query'}
                defaultValue={section}
                options={createOptions(api)}
                onChange={onSectionChange}
              />
            </Col>
            <Col span={17}>
              <Methods
                value={method}
                options={methods}
                onChange={onMethodChange}
              />
            </Col>
          </Row>

          {!!params.length && (
            <div className='params'>
              <Params onChange={setParamValues} params={params} />
            </div>
          )}
        </div>
        <div className='button'>
          <img onClick={onExec} src={AddSvg} alt='' />
        </div>
      </Input>
      <Result
        results={results}
        onDelete={index =>
          setResults([...results.slice(0, index), ...results.slice(index + 1)])
        }
      />
    </Wrapper>
  );
};
