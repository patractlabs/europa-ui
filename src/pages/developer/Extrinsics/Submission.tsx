import React, { FC, ReactElement, useCallback, useContext, useMemo, useState } from 'react';
import { Button, Col, message, Row } from 'antd';
import styled from 'styled-components';
import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { TypeDef } from '@polkadot/types/types';
import { ApiRx } from '@polkadot/api';
import { getTypeDef } from '@polkadot/types';
import { GenericCall } from '@polkadot/types';
import { AccountsContext, ApiContext, handleTxResults } from '../../../core';
import { Sections } from '../ChainState/Sections';
import { Methods } from '../ChainState/Methods';
import { RawParamOnChangeValue } from '../../../react-params/types';
import Params from '../../../react-params';
import { AddressInput, Style } from '../../../shared';
import keyring from '@polkadot/ui-keyring';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { u8aToHex } from '@polkadot/util';

const Wrapper = styled.div`
  padding: 20px;
`;

const Submit = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;
const Encoded = styled.div`
  border: 1px solid ${Style.color.border.default};
  padding: 6px 8px;

  > .span {
    color: ${Style.color.label.default};
  }
  
  > .p {
    color: ${Style.color.label.primary};
  }
`;

interface TypeDefExt extends TypeDef {
  withOptionActive?: boolean;
}

type ParamsType = { type: TypeDefExt }[];

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
  
  const [extrinsicHex, extrinsicHash] = useMemo(
    (): [string, string] => {
      const values = paramValues.map(p => p.value) as any[];
      const exec = api.tx[section][method.value];
      console.log('values', values);

      try {
        const extrinsic = exec(...values);
        const u8a = extrinsic.method.toU8a();
  
        // don't use the built-in hash, we only want to convert once
        return [u8aToHex(u8a), extrinsic.registry.hash(u8a).toHex()];
      } catch (e) {
        return ['0x', '0x'];
      }
    },
    [api.tx, section, method, paramValues],
  );

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
      <Encoded>
        <span>encoded call data</span>
        <p>{extrinsicHex}</p>
      </Encoded>
      <Encoded>
        <span>encoded call hash</span>
        <p>{extrinsicHash}</p>
      </Encoded>
      <Submit>
        <Button onClick={onUnsignedSubmit}>Submit Unsigned</Button>
        <Button onClick={onSignedSubmit}>Submit Transaction</Button>
      </Submit>
    </Wrapper>
  );
};
