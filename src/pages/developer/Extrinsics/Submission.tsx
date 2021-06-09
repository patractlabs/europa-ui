import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Button, Col, message, Row } from 'antd';
import styled from 'styled-components';
import type { StorageEntry } from '@polkadot/types/primitive/types';
import type { SubmittableExtrinsicFunction, QueryableStorageEntry } from '@polkadot/api/types';
import type { StorageEntryTypeLatest } from '@polkadot/types/interfaces';
import type { TypeDef } from '@polkadot/types/types';
import { ApiRx } from '@polkadot/api';
import { unwrapStorageType } from '@polkadot/types/primitive/StorageKey';
import { getTypeDef } from '@polkadot/types';
import { TypeDefInfo } from '@polkadot/types/types';
import { GenericCall } from '@polkadot/types';
import { AccountsContext, ApiContext, handleTxResults } from '../../../core';
import { Sections } from '../ChainState/Sections';
import { Methods } from '../ChainState/Methods';
import AddSvg from '../../../assets/imgs/add.svg';
import { RawParamOnChangeValue, RawParams } from '../../../react-params/types';
import Params from '../../../react-params';
import { AddressInput } from '../../../shared';
import keyring from '@polkadot/ui-keyring';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const Wrapper = styled.div`
  padding: 20px;
`;

const Submit = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
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
  return Object
    .keys(api.tx)
    .sort()
    .filter(name => Object.keys(api.tx[name]).length);
}

function getParams ({ meta }: SubmittableExtrinsicFunction<'rxjs'>): { name: string; type: TypeDef }[] {
  return GenericCall.filterOrigin(meta).map((arg): { name: string; type: TypeDef } => ({
    name: arg.name.toString(),
    type: getTypeDef(arg.type.toString())
  }));
}

function expandParams (st: StorageEntryTypeLatest, isIterable: boolean): ParamsType {
  let types: string[] = [];

  if (st.isDoubleMap) {
    types = [st.asDoubleMap.key1.toString(), st.asDoubleMap.key2.toString()];
  } else if (st.isMap) {
    types = [st.asMap.key.toString()];
  } else if (st.isNMap) {
    types = st.asNMap.keyVec.map((k) => k.toString());
  }

  return types.map((str, index) => {
    let type: TypeDefExt;

    if (isIterable && index === (types.length - 1)) {
      type = getTypeDef(`Option<${str}>`);
      type.withOptionActive = true;
    } else {
      type = getTypeDef(str);
    }

    return { type };
  });
}

function checkIterable (type: StorageEntryTypeLatest): boolean {
  // in the case of Option<type> keys, we don't allow map iteration, in this case
  // we would have option for the iterable and then option for the key value
  return type.isPlain || (
    type.isMap
      ? getTypeDef(type.asMap.key.toString())
      : type.isDoubleMap
        ? getTypeDef(type.asDoubleMap.key2.toString())
        : getTypeDef(type.asNMap.keyVec[type.asNMap.keyVec.length - 1].toString())
  ).info !== TypeDefInfo.Option;
}

function expandKey (api: ApiRx, sectionName: string, method: string): KeyState {
  const key = api.query[sectionName][method];
  const { creator: { meta: { type }, section } } = key;
  const isIterable = checkIterable(type);

  return {
    defaultValues: section === 'session' && type.isDoubleMap
      ? [{ isValid: true, value: api.consts.session.dedupKeyPrefix.toHex() }]
      : null,
    isIterable,
    key,
    params: expandParams(type, isIterable)
  };
}

const createMethods = (api: ApiRx, sectionName: string) => {
  const section = api.tx[sectionName];

  if (!section || Object.keys(section).length === 0) {
    return [];
  }

  return Object
    .keys(section)
    .sort()
    .map((value) => {
      const method = section[value];
      const inputs = method.meta.args
        .filter((arg): boolean => arg.type.toString() !== 'Origin')
        .map((arg): string => arg.name.toString())
        .join(', ');

      return {
        label: `${value}(${inputs})`,
        desc: (method.meta.documentation[0] || value).toString(),
        value,
      };
    });
};

export const Submission: FC = (): ReactElement => {
  const { api, tokenDecimal } = useContext(ApiContext);
  const { accounts } = useContext(AccountsContext);
  const [sender, setAccountId] = useState<string>();
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
  const [paramValues, setParamValues] = useState<RawParamOnChangeValue[]>([]);
  const [params, setParams] = useState<ParamsType>(getParams(api.tx[section][method.value]));

  const onUnsignedSubmit = useCallback(async () => {
    const exec = api.tx[section][method.value];
    const values = paramValues.map(p => p.value) as any[];

    console.log('values', values.map(v => v.toString()));

    exec(...values).send().pipe(
      catchError(e => {
        message.error(e.message || 'failed');
        return throwError('');
      })
    ).subscribe(handleTxResults({
      success() {
        message.success('executed');
      },
      fail(e) {
        console.log(e.events.map(e => e.toHuman()));
        message.error('failed');
      },
      update(r) {
        message.info(r.events.map(e => e.toHuman()));
      }
    }, () => {}));
  }, [api.tx, method.value, paramValues, section]);

  const onSignedSubmit = useCallback(async () => {
    const exec = api.tx[section][method.value];
    const account = accounts.find(account => account.address === sender);
    const suri = account?.mnemonic || `//${account?.name}`;
    const pair = keyring.createFromUri(suri);
    const values = paramValues.map(p => p.value) as any[];

    console.log('values', values.map(v => v.toString()));

    exec(...values).signAndSend(pair).pipe(
      catchError(e => {
        message.error(e.message || 'failed');
        return throwError('');
      })
    ).subscribe(handleTxResults({
      success() {
        message.success('executed');
      },
      fail(e) {
        console.log(e.events.map(e => e.toHuman()));
        message.error('failed');
      },
      update(r) {
        message.info(r.events.map(e => e.toHuman()));
      }
    }, () => {}));
  }, [accounts, api.tx, method.value, paramValues, section, sender]);

  const onSectionChange = useCallback((sectionName: string) => {
    const methods = createMethods(api, sectionName);
   
    setSection(sectionName);
    setMethods(methods);
    setMethod(methods[0]);
    setParams(getParams(api.tx[sectionName][methods[0].value]));
  }, [api]);

  const onMethodChange = useCallback((method: {
    value: string;
    label: string;
    desc: string;
  }) => {
    setMethod(method);
    setParams(getParams(api.tx[section][method.value]));
  }, [api, section]);

  return (
    <Wrapper>
      <AddressInput onChange={setAccountId}/>
      <Row style={{ marginTop: '10px' }}>
        <Col span={7}>
          <Sections defaultValue={section} options={createOptions(api)} onChange={onSectionChange} />
        </Col>
        <Col span={17}>
          <Methods value={method} options={methods} onChange={onMethodChange} />
        </Col>
      </Row>
      
      <Params
        onChange={setParamValues}
        params={params}
      />
      <Submit>
        <Button onClick={onUnsignedSubmit}>Submit Unsigned</Button>
        <Button onClick={onSignedSubmit}>Submit Transaction</Button>
      </Submit>
    </Wrapper>
  );
};
