import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import { hexToU8a } from '@polkadot/util';
import styled from 'styled-components';
import { ApiContext, BlocksContext, ExtendedExtrinsic, useContracts, useAbi } from '../../core';
import SuccessSvg from '../../assets/imgs/extrinsic-success.svg';
import FailSvg from '../../assets/imgs/extrinsic-fail.svg';
import InfoSvg from '../../assets/imgs/info.svg';
import BlockSvg from '../../assets/imgs/block.svg';
import { Link } from 'react-router-dom';
import { Style, LabelDefault, TitleWithBottomBorder, ValuePrimary, KeyValueLine, Obj, Args, Address, formatTimestamp } from '../../shared';
import { ContractTrace } from './Trace';
import { Abi } from '@polkadot/api-contract';
import { Col, Row, Tooltip } from 'antd';

const Wrapper = styled.div`
  padding: 20px;

  > div > .call-params {
    background: #eeece9;

    .data-toggle {
      font-weight: 600;

      span {
        cursor: pointer;
        color: ${Style.color.link.default};
        margin-right: 4px;
      }
      img {
        width: 14px;
        height: 14px;
      }
    }
  }
`;
const ExtrinsicHash = styled(TitleWithBottomBorder)`
  color: ${Style.color.label.default};
  display: flex;
  align-items: center;
  justify-content: center;

  > .hash {
    font-size: 20px;
    margin-left: 20px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
const ExtrinsicInfo = styled(Row)`
  padding: 20px;
  display: flex;
`;
const Result = styled.label<{ err: boolean }>`
  color: ${props => props.err ? Style.color.icon.fail : Style.color.success};
  font-size: 24px;
  margin-left: 10px;
  height: 24px;
  line-height: 24px;
`;

export interface Trace {
  args: string,
  caller: string,
  depth: number,
  env_trace: any[],
  ext_result: {
    Ok: {
      data: string;
      flags: number;
    }
    Err: {
      error: {
        Module: {
          error: number;
          index: number;
          message: Object;
        }
      };
      origin: string;
    }
  },
  gas_left: number,
  gas_limit: number,
  nests: Trace[],
  sandbox_result_ok: null,
  selector: string,
  self_account: string,
  trap_reason: {
    Return: {
      data: string;
      flags: number;
    }
  },
  value: string,
  wasm_error: {
    Trap: {
      code: string;
      trace: string[];
    }
  },
}

const decodeData = (extrinsic: ExtendedExtrinsic, abi: Abi | undefined, name: string, data: string, showRawData = false): string | Obj[] => {
  if (
    showRawData ||
    !abi ||
    name !== 'data' ||
    extrinsic.method.section.toLowerCase() !== 'contracts' ||
    (
      extrinsic.method.method.toLowerCase() !== 'call' &&
      extrinsic.method.method.toLowerCase() !== 'instantiate' &&
      extrinsic.method.method.toLowerCase() !== 'instantiatewithcode'
    )
  ) {
    return data;
  }

  const fun = abi.constructors.find(message => message.selector.toString() === data.slice(0, 10)) ||
    abi.messages.find(message => message.selector.toString() === data.slice(0, 10));
  
  if (!fun) {
    return data;
  }

  try {
    const message = fun.fromU8a(hexToU8a(`0x${data.slice(10)}`));

    return [
      { selector: `${message.message.identifier} (${data.slice(2, 10)})` },
      {
        parameters: message.args.map((arg, index) => ({
          [message.message.args[index].name]: arg.toHuman()
        }))
      },
    ] as unknown as Obj[];

  } catch (e) {}

  return data;
};

export const ExtrinsicDetail: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { api, wsProvider } = useContext(ApiContext);
  const [ trace, setTrace ] = useState<Trace>();
  const [ showRawData, setShowRawData ] = useState<boolean>(false);
  const { metadata } = useContext(ApiContext);
  const { contracts } = useContracts(api, blocks);
  const contract = useMemo(
    () =>
      contracts.find(contracts => contracts.address === trace?.self_account),
    [contracts, trace],
  );
  const { abi } = useAbi(contract?.codeHash || '');

  const extrinsic = useMemo(() => 
    blocks.reduce((extrinscis: ExtendedExtrinsic[], curr) => extrinscis.concat(curr.extrinsics), [])
      .find(extrinsic => extrinsic.hash.toString() === hash),
    [hash, blocks],
  );

  const args = useMemo(() => {
    if (!extrinsic) {
      return [];
    }

    type Module = {
      name: string;
      calls: {
        name: string;
        args: {
          name: string;
          type: string;
        }[];
        documantion: string;
      }[];
    };

    let modules: Module[] = [];

    try {
      modules = (metadata.toJSON().metadata as any)['v13'].modules as Module[];
    } catch (e) {}

    const args = modules
      .find(module => module.name.toLowerCase() === extrinsic.method.section.toLowerCase())?.calls
      .find(call => call.name.split('_').join('').toLowerCase() === extrinsic.method.method.toLowerCase())?.args || [];

    return extrinsic.args.map((arg, index) => ({
      [args[index]?.name || `${index}`]: decodeData(extrinsic, abi, args[index].name, arg.toString(), showRawData),
    } as unknown as Obj));
  }, [metadata, extrinsic, abi, showRawData]);

  useEffect(() => {
    if (!extrinsic) {
      return;
    }

    wsProvider.send('contractsExt_tracing', [
      extrinsic.height, extrinsic.indexInBlock
    ]).then(({ trace }: { trace: Trace}) => {
      setTrace(trace.depth ? trace : undefined);
    }, (e: any) => {
      console.log('e', e);
      setTrace(undefined);
    });
  }, [wsProvider, extrinsic]);

  return (
    <Wrapper>
      {
        extrinsic &&
          <div>
            <ExtrinsicHash>
              <label>
                Extrinsic Hash
              </label>
              <div className="hash">
                { extrinsic.hash.toString() }
              </div>
            </ExtrinsicHash>
            <ExtrinsicInfo>
              <Col span={12}>
                <KeyValueLine>
                  <img style={{ height: '24px', width: '24px' }} src={extrinsic.successed ? SuccessSvg : FailSvg } alt=""/>
                  <Result err={!extrinsic.successed}>{
                    extrinsic.successed ? 'Success' : 'Fail'
                  }</Result>
                </KeyValueLine>
                <KeyValueLine>
                  <LabelDefault>Method</LabelDefault>
                  <ValuePrimary>{ extrinsic.method.section }.{extrinsic.method.method}</ValuePrimary>
                </KeyValueLine>
                <KeyValueLine>
                  <LabelDefault>Signer</LabelDefault>
                  <ValuePrimary>
                    <Address address={
                      extrinsic.method.section.toLowerCase() === 'timestamp' && extrinsic.method.method.toLowerCase() === 'set' ?
                        '-' :
                        extrinsic.signer.toString()
                      }
                    />
                  </ValuePrimary>
                </KeyValueLine>
              </Col>
              <Col span={12}>
                <KeyValueLine>
                  <img style={{ width: '16px', height: '16px', marginRight: '4px' }} src={BlockSvg} alt="" />
                  <LabelDefault>
                    Block
                  </LabelDefault>
                  <ValuePrimary>
                    <Link to={`/block/${extrinsic.blockHash}`}>{extrinsic.height}</Link>
                  </ValuePrimary>
                </KeyValueLine>
                <KeyValueLine>
                  <LabelDefault>Timestamp</LabelDefault>
                  <ValuePrimary>{ formatTimestamp(extrinsic.timestamp) }</ValuePrimary>
                </KeyValueLine>
                <KeyValueLine>
                  <LabelDefault>Nonce</LabelDefault>
                  <ValuePrimary>{ extrinsic.nonce.toString() }</ValuePrimary>
                </KeyValueLine>
              </Col>
            </ExtrinsicInfo>
            <div className="call-params">
              {
                args &&
                  <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                    <Args args={args} DataRender={!abi ? undefined : () => {
                      return (
                        <div className="data-toggle" onClick={() => setShowRawData(old => !old)}>
                          <Tooltip placement="top" title={`Switch to ${!showRawData ? 'raw' : 'decoded'} data`}>
                            <span>
                              data
                            </span>
                            <img src={InfoSvg} alt="" />
                          </Tooltip>
                        </div>
                      );
                    }} />
                  </div>
              }
            </div>
          </div>
      }
      {
        trace &&
          <ContractTrace index={0} trace={trace} />
      }
    </Wrapper>
  );
};
