import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import { hexToU8a } from '@polkadot/util';
import styled from 'styled-components';
import { store, ApiContext, BlocksContext, Extrinsic, useContracts } from '../../core';
import SuccessSvg from '../../assets/imgs/extrinsic-success.svg';
import FailSvg from '../../assets/imgs/extrinsic-fail.svg';
import BlockSvg from '../../assets/imgs/block.svg';
import { Link } from 'react-router-dom';
import { Style, LabelDefault, TitleWithBottomBorder, ValueDefault, KeyValueLine, Obj, Args } from '../../shared';
import { ContractTrace } from './Trace';
import { Abi } from '@polkadot/api-contract';

const Wrapper = styled.div`
`;
const ExtrinsicHash = styled(TitleWithBottomBorder)`
  color: ${Style.color.label.default};
  display: flex;
  align-items: center;
  justify-content: center;

  > .hash {
    font-size: 20px;
    margin-left: 20px;
  }
`;
const ExtrinsicInfo = styled.div`
  padding: 20px;
  display: flex;
`;
const ExtrinsicLeft = styled.div`
  width: 50%;
`;
const ExtrinsicRight = styled.div`
  width: 50%;
`;
const Result = styled.label<{ err: boolean }>`
  color: ${props => props.err ? Style.color.icon.fail : Style.color.success};
  font-size: 24px;
  margin-left: 10px;
  height: 24px;
  line-height: 24px;
`;

const Label = styled(LabelDefault)`
  margin-right: 8px;
`;

type ExtendedExtrinsic = Extrinsic & {
  blockHash: string;
  height: number;
  index: number;
  timestamp: string;
};

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

const decodeData = (extrinsic: Extrinsic, abi: Abi | undefined, name: string, data: string): string | Obj[] => {
  if (
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
    console.log('argsssssss', message.args.map((arg, index) => ({
      [message.message.args[index].name]: arg.toHuman()
    })));

    return message.args.map((arg, index) => ({
      [message.message.args[index].name]: arg.toHuman()
    })) as unknown as Obj[];
  } catch (e) {}

  return data;
};

export const ExtrinsicDetail: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { api, wsProvider } = useContext(ApiContext);
  const [ trace, setTrace ] = useState<Trace>();
  const { metadata } = useContext(ApiContext);
  const { contracts } = useContracts(api, blocks);

  const contract = useMemo(
    () =>
      contracts.find(contracts => contracts.address === trace?.self_account),
    [contracts, trace],
  );

  const abi = useMemo(() => {
    if (!contract) {
      return;
    }

    store.loadAll();

    return store.getCode(contract.codeHash)?.contractAbi;
  }, [contract]);

  const extrinsic: ExtendedExtrinsic | undefined = useMemo(() => {
    let _extrinsic: ExtendedExtrinsic | undefined;
    
    blocks.find(_block => {
      const index = _block.extrinsics.findIndex(extrinsic => extrinsic.hash.toString() === hash);
      const setTimeExtrinsic = _block.extrinsics.find(extrinsic =>
        extrinsic.method.section.toString() === 'timestamp' && extrinsic.method.method.toString() === 'set'
      );

      if (index < 0 || !setTimeExtrinsic) {
        return false;
      }

      _extrinsic =  Object.assign(_block.extrinsics[index], {
        blockHash: _block.blockHash,
        height: _block.height,
        index,
        timestamp: setTimeExtrinsic?.args[0].toString(),
      });

      return true;
    });

    return _extrinsic;
  }, [hash, blocks]);

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
      [args[index]?.name || `${index}`]: decodeData(extrinsic, abi, args[index].name, arg.toString()),
    } as unknown as Obj));
  }, [metadata, extrinsic, abi]);

  useEffect(() => {
    if (!extrinsic) {
      return;
    }

    wsProvider.send('contractsExt_tracing', [
      extrinsic.height, extrinsic.index      
    ]).then(({ trace }: { trace: Trace}) => {
      console.log('trace', trace);
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
              <Label>
                Extrinsic Hash
              </Label>
              <span className="hash">
                { extrinsic.hash.toString() }
              </span>
            </ExtrinsicHash>
            <ExtrinsicInfo>
              <ExtrinsicLeft>
                <KeyValueLine>
                  <img style={{ height: '24px', width: '24px' }} src={extrinsic.successed ? SuccessSvg : FailSvg } alt=""/>
                  <Result err={!extrinsic.successed}>{
                    extrinsic.successed ? 'Success' : 'Fail'
                  }</Result>
                </KeyValueLine>
                <KeyValueLine>
                  <Label>Method</Label>
                  <ValueDefault>{ extrinsic.method.section }.{extrinsic.method.method}</ValueDefault>
                </KeyValueLine>
              </ExtrinsicLeft>
              <ExtrinsicRight>
                <KeyValueLine>
                  <img style={{ width: '16px', height: '16px', marginRight: '4px' }} src={BlockSvg} alt="" />
                  <Label>
                    Block
                  </Label>
                  <ValueDefault>
                    <Link to={`/block/${extrinsic.blockHash}`}>{extrinsic.height}</Link>
                  </ValueDefault>
                </KeyValueLine>
                <KeyValueLine>
                  <Label>Timestamp</Label>
                  <ValueDefault>{ (new Date(parseInt(extrinsic.timestamp))).toUTCString() }</ValueDefault>
                </KeyValueLine>
              </ExtrinsicRight>
            </ExtrinsicInfo>
            <div>
              {
                args &&
                  <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                    <Args args={args} />
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
