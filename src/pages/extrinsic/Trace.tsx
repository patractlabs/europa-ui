import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Args as ArgsDisplay, KeyValueLine, LabelDefault, Style, ValueDefault, ValuePrimary } from '../../shared';
import { Trace } from './Detail';
import MoveSVG from '../../assets/imgs/more.svg';
import InfoSvg from '../../assets/imgs/info.svg';
import { ApiContext, BlocksContext, useContracts, useAbi } from '../../core';
import { hexToU8a } from '@polkadot/util';
import { Abi } from '@polkadot/api-contract';
import { Link } from 'react-router-dom';
import { Col, Row, Tooltip } from 'antd';

const depthColors = [
  Style.color.button.primary,
  '#DFC49A',
  '#95BEEB',
  '#AA94DC',
  '#D9A4D8',
  '#E69696',
  '#81CBB5',
];

const Wrapper = styled.div<{ err: boolean, depth: number }>`
  margin-top: 10px;
  position: relative;
  background-color: ${props => props.err ? Style.color.bg.error : ''};
  margin-left: ${props => (props.depth - 1) * 20}px;

  > .border-base {
    position: absolute;
    top: 0px;
    bottom: 0px;
    width: 4px;
    background-color: ${props => depthColors[props.depth - 1 % depthColors.length]};
    opacity: 0.2;
  }
  > .contract {
    border: 1px solid ${Style.color.border.default};
    border-left: 4px solid ${props => depthColors[props.depth - 1 % depthColors.length]};

    > .main-info {
      padding: 20px;
    }
    > .detail {
      border-top: 1px solid ${Style.color.border.default};
      padding: 20px;

      .data-toggle {
        font-weight: 600;
      }
      .args-toggle {
        margin-right: 8px;

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
      .no-abi {
        margin-bottom: 8px;
        padding-left: 12px;
        font-weight: 600;
      }
      > .error {
        color: ${Style.color.label.error};
        display: flex;
        margin-top: 14px;

        > .error-trap {
          margin-left: 8px;
          flex: 1;
          border: 1px solid ${Style.color.border.error};
          background-color: #FFF9FA;
          padding: 12px;
        }
      }
    }
  }
  .text-overflow {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 15px;
  }
`;
const Line = styled.div`
  display: flex;
  margin-top: 5px;
`;
const Toggle = styled.div<{ expanded: boolean }>`
  padding: 0px 20px;
  cursor: pointer;
  border-top: 1px solid ${Style.color.border.default};
  height: 36px;
  color: ${Style.color.primary};
  
  > div {
    float: right;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    
    > img {
      width: 16px;
      height: 16px;
      margin-left: 4px;
      transform: ${props => props.expanded ? 'scaleY(-1)' : 'scaleY(1)'}
    }
  }
`;
const Args = styled.div`
  border: 1px solid ${Style.color.button.primary};
  border-radius: 5px;
  height: 500px;
  background: ${Style.color.bg.second};
  word-break: break-all;
  word-wrap: break-word;
  overflow-y: auto;
  padding: 12px;
  flex: 1;
`;

const getIdentifer = (abi: Abi, selector: string): string => {
  return abi.messages.find(c => c.selector.toString() === selector)?.identifier ||
    abi.constructors.find(c => c.selector.toString() === selector)?.identifier || selector;
};

const getArgs = (abi: Abi, selector: string, args: string) => {
  const message = abi.messages.find(c => c.selector.toString() === selector) ||
    abi.constructors.find(c => c.selector.toString() === selector);
  
  if (!message) {
    return [];
  }

  const values = message.fromU8a(hexToU8a(args)).args;

  return message.args.reduce((old: {[key: string]: any}, {name}, index) => {
    old[name] = values[index]?.toJSON();
    return old;
  }, {})
};

export const ContractTrace: FC<{
  index: number;
  trace: Trace;
  codeHash?: string;
  gasLeft?: number;
}> = ({ trace, codeHash }): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const [ showDetail, setShowDetail ] = useState<boolean>(false);
  const [ showRawData, setShowRawData ] = useState<boolean>(false);
  const contract = useMemo(
    () => contracts.find(contracts => contracts.address === trace.self_account),
    [contracts, trace],
  );
  const { abi, name } = useAbi(contract?.codeHash || codeHash || '');

  return (
    <Wrapper err={!!trace.ext_result.Err} depth={trace.depth}>
      <div className="border-base" />
      <div className="contract">
        <div className="main-info">
          <Row style={{ marginBottom: '10px' }}>
            <Col className="text-overflow" span={12}>
              <LabelDefault>From</LabelDefault>
              <ValueDefault>{trace.caller}</ValueDefault>
            </Col>
            <Col span={12}>
              <LabelDefault>Value</LabelDefault>
              <ValueDefault>{trace.value}</ValueDefault>
            </Col>
          </Row>
          <Row style={{ marginBottom: '10px' }}>
            <Col className="text-overflow" span={12}>
              <LabelDefault>To</LabelDefault>
              <ValueDefault>
                {
                  contract?.address.toString() ?
                    <Link to={`/contract/instances/${contract?.address.toString()}`}>
                      {name && name + ' : '}
                      {trace.self_account}
                    </Link> :
                    <span>{trace.self_account}</span>
                }
              </ValueDefault>
            </Col>
            <Col span={12}>
              <LabelDefault>Gas Limit</LabelDefault>
              <ValueDefault>{trace.gas_limit}</ValueDefault>
            </Col>
          </Row>
          <Row>
            <Col className="text-overflow" span={12}>
              <LabelDefault>Gas Consumed</LabelDefault>
              <ValueDefault>
                {trace.gas_limit - trace.gas_left}
              </ValueDefault>
            </Col>
            <Col className="text-overflow" span={12}>
              <LabelDefault>Gas Left</LabelDefault>
              <ValueDefault>{trace.gas_left}</ValueDefault>
            </Col>
          </Row>
        </div>
        {
          showDetail &&
            <div className="detail">
              <Row>
                <Col span={12} style={{ paddingRight: '40px' }}>
                  <KeyValueLine>
                    <LabelDefault>Function</LabelDefault>
                    <ValuePrimary>{
                      abi ? getIdentifer(abi, trace.selector) : trace.selector
                    }</ValuePrimary>
                  </KeyValueLine>
                  <Line>
                    <div className="args-toggle data-toggle" onClick={() => setShowRawData(old => !old)}>
                      <Tooltip placement="top" title={`Switch to ${!showRawData ? 'raw' : 'decoded'} data`}>
                        <span>
                          Args
                        </span>
                        <img src={InfoSvg} alt="" />
                      </Tooltip>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      { !abi && <p className="no-abi">Please upload metadata first!</p> }
                      <Args  style={{ height: !!abi ? '500px' : '470px', position: 'absolute', left: '0px', right: '0px' }}>
                        {
                          abi && !showRawData ?
                            trace.args?.length ?
                              <ArgsDisplay args={getArgs(abi, trace.selector, trace.args) as any} /> :
                              <div></div>
                              :
                            <div>
                              {trace.args}
                            </div>
                        }
                      </Args>
                    </div>
                  </Line>
                </Col>
                <Col span={12}>
                  <KeyValueLine>
                    <LabelDefault>Trap Reason</LabelDefault>
                    <ValueDefault>{JSON.stringify(trace.trap_reason)}</ValueDefault>
                  </KeyValueLine>
                  <Line>
                    <LabelDefault>Env trace</LabelDefault>
                    {/* <Args>
                      <pre>{JSON.stringify(trace.env_trace, null, 2)}</pre>
                    </Args> */}
                    <Args>
                      {
                        trace.env_trace.map((env, index) =>
                          <ArgsDisplay key={index} args={env} withoutBottom={index !== trace.env_trace.length - 1} />
                        )
                      }
                    </Args>
                  </Line>
                </Col>
              </Row>
              {
                !!trace.ext_result.Err &&
                  <div className="error">
                    <span>Wasm Error</span>
                    <div className="error-trap">
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '40px', marginRight: '10px' }}>Code</span>
                        <div>
                          { trace.wasm_error.Trap.code }
                        </div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '40px', marginRight: '10px' }}>Trap</span>
                        <div>
                          {
                            trace.wasm_error.Trap.trace.map((t, index) =>
                              <div key={index}>{t}</div>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>
              }
            </div>
        }
        <Toggle expanded={showDetail} onClick={() => setShowDetail(!showDetail)}>
          <div>
            <span>More Details</span>
            <img src={MoveSVG} alt="" />
          </div>
        </Toggle>
      </div>
      {
        trace.nests.length > 0 &&
        trace.nests.map((child, index) =>
          <ContractTrace key={index} index={index} trace={child} />
        )
      }
    </Wrapper>
  );
};
