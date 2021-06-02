import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ApiContext, BlocksContext, Extrinsic } from '../../core';
import SuccessSvg from '../../assets/imgs/extrinsic-success.svg';
import BlockSvg from '../../assets/imgs/block.svg';
import { Link } from 'react-router-dom';
import { Style, LabelDefault, TitleWithBottomBorder, ValueDefault, KeyValueLine } from '../../shared';
import { ContractTrace } from './Trace';

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
const Success = styled.label`
  color: ${Style.color.success};
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
  gasLimit: string;
  gasUsed: string;
  fee: string;
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

export const ExtrinsicDetail: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { wsProvider } = useContext(ApiContext);
  const [ trace, setTrace ] = useState<Trace>();
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
        gasLimit: '',
        gasUsed: '',
        fee: '',
      });

      return true;
    });

    return _extrinsic;
  }, [hash, blocks]);

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
                  <img style={{ height: '24px', width: '24px' }} src={SuccessSvg} alt=""/>
                  <Success>Success</Success>
                </KeyValueLine>
                <KeyValueLine>
                  <Label>Timestamp</Label>
                  <ValueDefault>{ extrinsic.timestamp }</ValueDefault>
                </KeyValueLine>
                <KeyValueLine>
                  <img style={{ width: '16px', height: '16px', marginRight: '4px' }} src={BlockSvg} alt="" />
                  <Label>
                    Block
                  </Label>
                  <ValueDefault>
                    <Link to={`/block/${extrinsic.blockHash}`}>{extrinsic.height}</Link>
                  </ValueDefault>
                </KeyValueLine>
              </ExtrinsicLeft>
              <ExtrinsicRight>
                <KeyValueLine>
                  <Label>Gas Limit</Label>
                  <ValueDefault>{ extrinsic.gasLimit }</ValueDefault>
                </KeyValueLine>
                <KeyValueLine>
                  <Label>Gas Used by extrinsic</Label>
                  <ValueDefault>{ extrinsic.gasUsed }</ValueDefault>
                </KeyValueLine>
                <KeyValueLine>
                  <Label>Extrinsic fee</Label>
                  <ValueDefault>{ extrinsic.fee }</ValueDefault>
                </KeyValueLine>
              </ExtrinsicRight>
            </ExtrinsicInfo>
          </div>
      }
      {
        trace &&
          <ContractTrace index={0} trace={trace} />
      }
    </Wrapper>
  );
};
