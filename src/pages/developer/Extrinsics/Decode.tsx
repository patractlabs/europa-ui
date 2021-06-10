import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Col, Input as AntInput, Row } from 'antd';
import styled from 'styled-components';
import { ApiContext } from '../../../core';
import { assert, isHex } from '@polkadot/util';
import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Call } from '@polkadot/types/interfaces/runtime';
import { Style } from '../../../shared';
import { CallDisplay } from './CallDisplay';

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
interface ExtrinsicInfo {
  extrinsicCall: Call | null;
  extrinsicError: string | null;
  extrinsicFn: SubmittableExtrinsicFunction<'rxjs'> | null;
  extrinsicHash: string | null;
  extrinsicHex: string | null;
}

const DEFAULT_INFO: ExtrinsicInfo = {
  extrinsicCall: null,
  extrinsicError: null,
  extrinsicFn: null,
  extrinsicHash: null,
  extrinsicHex: null
};
export const Decode: FC = (): ReactElement => {
  const { api } = useContext(ApiContext);
  const [{ extrinsicCall, extrinsicError, extrinsicFn, extrinsicHash }, setExtrinsicInfo] = useState<ExtrinsicInfo>(DEFAULT_INFO);

  const _setExtrinsicHex = useCallback(
    (extrinsicHex: string): void => {
      try {
        assert(isHex(extrinsicHex), 'Expected a hex-encoded call');

        let extrinsicCall: Call;

        try {
          // cater for an extrinsic input...
          extrinsicCall = api.createType('Call', api.tx(extrinsicHex).method);
        } catch (e) {
          extrinsicCall = api.createType('Call', extrinsicHex);
        }

        const extrinsicHash = extrinsicCall.hash.toHex();
        const { method, section } = api.registry.findMetaCall(extrinsicCall.callIndex);
        const extrinsicFn = api.tx[section][method];

        setExtrinsicInfo({ ...DEFAULT_INFO, extrinsicCall, extrinsicFn, extrinsicHash, extrinsicHex });
      } catch (e) {
        setExtrinsicInfo({ ...DEFAULT_INFO, extrinsicError: (e as Error).message });
      }
    },
    [api]
  );

  return (
    <Wrapper>
      <Input>
        <AntInput onChange={e => _setExtrinsicHex(e.target.value)} />
      </Input>
      {
        extrinsicFn &&
          <Row>
            <Col span={12}>{extrinsicFn.section}</Col>
            <Col span={12}>{extrinsicFn.method}</Col>
          </Row>
      }
      {
        extrinsicCall &&
          <CallDisplay value={extrinsicCall} />
      }
      <Encoded>
        <span>encoded call hash</span>
        <p>{extrinsicHash}</p>
      </Encoded>
    </Wrapper>
  );
};
