import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Args, LabelDefault, Style, ValueDefault, ValuePrimary } from '../../shared';
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

      > .line {
        display: flex;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0px;
        }

        > .key {
          width: 100px;
        }

        > .value {
          flex: 1;
          width: 0;

          > .raw-args {
            word-break: break-all;
            overflow-wrap: anywhere;
          }
        }
      }
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
              <div className="line">
                <div className="key">
                  <LabelDefault>Function</LabelDefault>
                </div>
                <div className="value">
                  <ValuePrimary>{
                    abi ? getIdentifer(abi, trace.selector) : trace.selector
                  }</ValuePrimary>
                </div>
              </div>
              <div className="line">
                <div className="key">
                  <LabelDefault>Trap Reason</LabelDefault>
                </div>
                <div className="value">
                  <pre>{JSON.stringify(trace.trap_reason, null, 2)}</pre>
                </div>
              </div>
              <div className="line">
                <div className="key">
                  { 
                    !abi ?
                      <LabelDefault>Args</LabelDefault> :
                      <div className="args-toggle data-toggle" onClick={() => setShowRawData(old => !old)}>
                        <Tooltip placement="top" title={`Switch to ${!showRawData ? 'raw' : 'decoded'} data`}>
                          <span>
                            Args
                          </span>
                          <img src={InfoSvg} alt="" />
                        </Tooltip>
                      </div>
                  }
                </div>
                <div className="value">
                  { !abi && <p className="no-abi">Please upload metadata first!</p> }
                  {
                    abi && !showRawData ?
                      trace.args?.length ?
                        <Args args={getArgs(abi, trace.selector, trace.args) as any} /> :
                        <div>null</div>
                        :
                      <div  className="raw-args">
                        {trace.args}
                      </div>
                  }
                </div>
              </div>
              <div className="line">
                <div className="key">
                  <LabelDefault>Env trace</LabelDefault>
                </div>
                <div className="value">
                  <div>
                    {
                      trace.env_trace.map((env, index) =>
                        <Args key={index} args={env} withoutBottom={index !== trace.env_trace.length - 1} />
                      )
                    }
                  </div>
                </div>
              </div>

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
