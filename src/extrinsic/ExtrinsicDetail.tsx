import React, { FC, ReactElement, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { BlocksContext, Extrinsic } from '../core/provider/blocks.provider';
import { Style } from '../shared/styled/const';
import { KeyValueLine } from '../shared/styled/KeyValueLine';
import SuccessSvg from '../assets/imgs/extrinsic-success.svg';
import BlockSvg from '../assets/imgs/block.svg';
import { ValueDefault } from '../shared/styled/ValueDefault';
import { Link } from 'react-router-dom';
import { TitleWithBottom } from '../shared/styled/TitleWithBottom';
import { LabelDefault } from '../shared/styled/LabelDefault';

const Wrapper = styled.div`
`;
const ExtrinsicHash = styled(TitleWithBottom)`
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
  timestamp: string;
  gasLimit: string;
  gasUsed: string;
  fee: string;
};

export const ExtrinsicDetail: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const extrinsic: ExtendedExtrinsic | undefined = useMemo(() => {
    let _extrinsic: ExtendedExtrinsic | undefined;
    
    blocks.find(_block => {
      const e = _block.extrinsics.find(extrinsic => extrinsic.hash.toString() === hash);
      const setTimeExtrinsic = _block.extrinsics.find(extrinsic => extrinsic.method.section.toString() === 'timestamp' && extrinsic.method.method.toString() === 'set');

      if (!e || !setTimeExtrinsic) {
        return false;
      }

      _extrinsic =  Object.assign(e, {
        blockHash: _block.blockHash,
        height: _block.height,
        timestamp: setTimeExtrinsic?.args[0].toString(),
        gasLimit: '',
        gasUsed: '',
        fee: '',
      });

      return true;
    });

    return _extrinsic;
  }, [hash, blocks]);

  console.log('extrinsic', extrinsic?.method.toHuman(), extrinsic?.args.map(a => a.toHuman()));

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
    </Wrapper>
  );
};
