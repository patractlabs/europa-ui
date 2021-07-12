import React, { FC, CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Extrinsic } from '../../core';
import { formatAddress, lookForDestAddress } from '../util';
import TransferArrowSVG from '../../assets/imgs/transfer-arrow.svg';
import Identicon from '@polkadot/react-identicon';
import { Style } from '../styled';

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  > img {
    margin: 0px 20px;
    width: 20px;
    height: 20px;
  }
  > .from, > .to {
    width: 155px;
    color: ${Style.color.label.default};
  }
`;
const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const Address: FC<{ address: string; signer?: string }> = ({ address, signer }): ReactElement => {
  return (
    <AddressWrapper>
      <Identicon
          style={{ marginRight: '10px' }}
          value={address}
          size={20}
          theme='polkadot'
        />
        {
          signer === address || address === '-' ? 
            <span>{formatAddress(address)}</span>
            :
            <Link to={`/explorer/eoa/${address}`}>
              {formatAddress(address)}
            </Link>
        }
    </AddressWrapper>
  );
};

export const Transfer: FC<{ signer?: string; style?: CSSProperties, record: Extrinsic }> = ({ signer, style, record }): ReactElement => {
  return (
    <Wrapper style={style}>
      <div className="from">
        <Address address={
          record.method.section.toLowerCase() === 'timestamp' && record.method.method.toLowerCase() === 'set' ?
            '-' :
            record.signer.toString()
          } signer={signer} />
      </div>
      <img src={TransferArrowSVG} alt="" />
      <div className="to">
        {
          lookForDestAddress(record) ?
            <Address address={lookForDestAddress(record)} signer={signer} />
            :
            <span>-</span>
        }
      </div>
    </Wrapper>
  );
};
