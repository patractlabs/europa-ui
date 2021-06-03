import React, { FC, CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Extrinsic } from '../../core';
import { formatAddress, lookForDestAddress } from '../util';
import TransferArrowSVG from '../../assets/imgs/transfer-arrow.svg';

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  > img {
    margin: 0px 20px;
    width: 20px;
    height: 20px;
  }
  > .from, > .to {
    width: 123px;
  }
`;

export const Transfer: FC<{ signer?: string; style?: CSSProperties, record: Extrinsic }> = ({ signer, style, record }): ReactElement => {
  return (
    <Wrapper style={style}>
      <div className="from">
        {
          signer === record.signer.toString() ? 
            <span>{formatAddress(record.signer.toString())}</span> :
            <Link to={`/explorer/eoa/${record.signer.toString()}`}>{formatAddress(record.signer.toString())}</Link>
        }
      </div>
      <img src={TransferArrowSVG} alt="" />
      <div className="to">
        {
          lookForDestAddress(record) ?
            signer === lookForDestAddress(record) ? 
              <span>{formatAddress(lookForDestAddress(record))}</span> :
              <Link to={`/explorer/eoa/${lookForDestAddress(record)}`}>{formatAddress(lookForDestAddress(record))}</Link>
            :
            <span>-</span>
        }
      </div>
    </Wrapper>
  );
};
