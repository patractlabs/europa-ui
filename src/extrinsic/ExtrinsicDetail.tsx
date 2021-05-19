import React, { FC, ReactElement, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { BlocksContext, Extrinsic } from '../core/provider/blocks.provider';
import { Style } from '../shared/styled/const';
import { KeyValueLine } from '../shared/styled/KeyValueLine';
import { LabelDefault } from '../shared/styled/LabelDefault';
import SuccessSvg from '../assets/imgs/extrinsic-success.svg';
import { ValueDefault } from '../shared/styled/ValueDefault';

const Wrapper = styled.div`
`;
const ExtrinsicHash = styled.h2`
  padding-bottom: 20px;
  border-bottom: 1px solid ${Style.color.border};
  margin: 0px auto;
  color: #8C8B8C;
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

type ExtendedExtrinsic = Extrinsic & {
  
};

export const ExtrinsicDetail: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { blocks } = useContext(BlocksContext);

  const extrinsic = useMemo(() =>
    blocks.reduce((extrinsics: Extrinsic[], block) => extrinsics.concat(block.extrinsics), [])
      .find(extrinsic => extrinsic.hash.toString() === hash),
    [hash, blocks],
  );

  console.log('extrinsic', extrinsic?.args.map(a => a.toHuman()));
  

  return (
    <Wrapper>
      {
        extrinsic &&
          <div>
            <ExtrinsicHash>
              <LabelDefault>
                Extrinsic Hash
              </LabelDefault>
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
                  <LabelDefault>Timestamp</LabelDefault>
                  {/* <ValueDefault>{ extrinsic. }</ValueDefault> */}
                </KeyValueLine>
              </ExtrinsicLeft>
              <ExtrinsicRight>
                <KeyValueLine>
                  <img style={{ height: '24px', width: '24px' }} src={SuccessSvg} alt=""/>
                  <Success>Success</Success>
                </KeyValueLine>
              </ExtrinsicRight>
            </ExtrinsicInfo>
          </div>
      }
    </Wrapper>
  );
};
