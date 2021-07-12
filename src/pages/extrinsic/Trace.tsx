import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { KeyValueLine, LabelDefault, Style, ValueDefault, ValuePrimary } from '../../shared';
import { Trace } from './Detail';
import MoveSVG from '../../assets/imgs/more.svg';
import { ApiContext, BlocksContext, useContracts, useAbi } from '../../core';
import { hexToU8a } from '@polkadot/util';
import { Abi } from '@polkadot/api-contract';
import { Link } from 'react-router-dom';
import { Col, Row } from 'antd';
import { Args as ArgsDisplay } from '../../shared';

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

  .text-overflow {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 15px;
  }
`;
const BorderBase = styled.div<{ depth: number }>`
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 4px;
  background-color: ${props => depthColors[props.depth - 1 % depthColors.length]};
  opacity: 0.2;
`;
const Contract = styled.div<{ depth: number }>`
  border: 1px solid ${Style.color.border.default};
  border-left: 4px solid ${props => depthColors[props.depth - 1 % depthColors.length]};
  `;
const MainInfo = styled.div`
  padding: 20px;
`;

const Line = styled.div`
  display: flex;
  margin-top: 5px;
`;
const Detail = styled.div`
  border-top: 1px solid ${Style.color.border.default};
  padding: 20px;

  .no-abi {
    margin-bottom: 8px;
    padding-left: 12px;
    font-weight: 600;
  }
`;
const Error = styled.div`
  color: ${Style.color.label.error};
  display: flex;
  margin-top: 14px;
`;
const ErrorTrap = styled.div`
  margin-left: 8px;
  flex: 1;
  border: 1px solid ${Style.color.border.error};
  background-color: #FFF9FA;
  padding: 12px;
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
}> = ({ trace }): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const contract = useMemo(
    () => contracts.find(contracts => contracts.address === trace.self_account),
    [contracts, trace],
  );
  const { abi, name } = useAbi(contract?.codeHash || '');

  return (
    <Wrapper err={!!trace.ext_result.Err} depth={trace.depth}>
      <BorderBase depth={trace.depth} />
      <Contract depth={trace.depth}>
        <MainInfo>
          <Row style={{ marginBottom: '10px' }}>
            <Col className="text-overflow" span={12}>
              <LabelDefault>From</LabelDefault>
              <ValueDefault>{trace.caller}</ValueDefault>
            </Col>
            <Col span={12}>
              <LabelDefault>Value</LabelDefault>
              <ValuePrimary>{trace.value}</ValuePrimary>
            </Col>
          </Row>
          <Row>
            <Col className="text-overflow" span={12}>
              <LabelDefault>To</LabelDefault>
              <ValuePrimary>
                {
                  contract?.address.toString() ?
                    <Link to={`/contract/instances/${contract?.address.toString()}`}>
                      {name && name + ' : '}
                      {trace.self_account}
                    </Link> :
                    <span>{trace.self_account}</span>
                }
              </ValuePrimary>
            </Col>
            <Col span={12}>
              <LabelDefault>Gas Left</LabelDefault>
              <ValueDefault>{trace.gas_left}</ValueDefault>
            </Col>
            {/* <Col span={6}>
              <LabelDefault>Gas used</LabelDefault>
              <ValueDefault>-</ValueDefault>
            </Col> */}
          </Row>
        </MainInfo>
        {
          showDetail &&
            <Detail>
              <Row>
                <Col span={12} style={{ paddingRight: '40px' }}>
                  <KeyValueLine>
                    <LabelDefault>Function</LabelDefault>
                    <ValueDefault>{
                      abi ? getIdentifer(abi, trace.selector) : trace.selector
                    }</ValueDefault>
                  </KeyValueLine>
                  <Line>
                    <LabelDefault>Args</LabelDefault>
                    <div>
                      <p className="no-abi">Please upload ABI first!</p>
                      <Args  style={{ height: '470px' }}>
                      {
                        abi ?
                            <ArgsDisplay args={getArgs(abi, trace.selector, trace.args) as any} />
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
                  <Error>
                    <span>Wasm Error</span>
                    <ErrorTrap>
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
                    </ErrorTrap>
                  </Error>
              }
            </Detail>
        }
        <Toggle expanded={showDetail} onClick={() => setShowDetail(!showDetail)}>
          <div>
            <span>More Details</span>
            <img src={MoveSVG} alt="" />
          </div>
        </Toggle>
      </Contract>
      {
        trace.nests.length > 0 &&
        trace.nests.map((child, index) =>
          <ContractTrace key={index} index={index} trace={child} />
        )
      }
    </Wrapper>
  );
};
