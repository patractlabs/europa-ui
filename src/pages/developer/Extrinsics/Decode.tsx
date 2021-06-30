import React, { FC, ReactElement, useCallback, useContext, useState } from 'react';
import { Col, Input as AntInput, Row } from 'antd';
import styled from 'styled-components';
import { ApiContext } from '../../../core';
import { assert, isHex } from '@polkadot/util';
import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Call } from '@polkadot/types/interfaces/runtime';
import { CallDisplay } from './CallDisplay';
import Encoded from '../shared/Encoded';
import { Style } from '../../../shared';
import LabeledInput from '../shared/LabeledInput';

const Wrapper = styled.div`
  padding: 20px;
  flex: 1;
  background-color: white;

  .encoded-data {
    width: 100%;
  }

  .section-method {

    .section > div, .method > div {
      width: 100%;
    }
    .section {
      padding-left: 4px;
      display: flex;
      align-items: center;
      border: 1px solid ${Style.color.border.default};
      border-right-width: 0px;
    }
    .method {
      padding-left: 4px;
      display: flex;
      align-items: center;
      border: 1px solid ${Style.color.border.default};
    }
  }
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
  const [{ extrinsicCall, extrinsicFn, extrinsicHash }, setExtrinsicInfo] = useState<ExtrinsicInfo>(DEFAULT_INFO);

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
      <Input style={{ marginBottom: '20px' }}>
        <div className="encoded-data">
          <LabeledInput>
            <div className="span">Encoded Data</div>
            <AntInput onChange={e => _setExtrinsicHex(e.target.value)} />
          </LabeledInput>
        </div>
      </Input>
      {
        extrinsicFn &&
          <Row className="section-method">
            <Col className="section" span={12}>
              <Encoded style={{ borderWidth: '0px' }}>
                <span>section</span>
                <p>{extrinsicFn.section}</p>
              </Encoded>
            </Col>
            <Col className="method" span={12}>
              <Encoded style={{ borderWidth: '0px' }}>
                <span>method</span>
                <p>{extrinsicFn.method}</p>
              </Encoded>
            </Col>
          </Row>
      }
      {
        extrinsicCall &&
          <CallDisplay value={extrinsicCall} />
      }
      {
        extrinsicHash &&
          <Encoded>
            <span>encoded call hash</span>
            <p>{extrinsicHash}</p>
          </Encoded>
      }
    </Wrapper>
  );
};
