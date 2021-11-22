import { FC } from 'react';
import type { DispatchError } from '@polkadot/types/interfaces';
import { Metadata } from '@polkadot/types';
import { getDispatchError } from '../../core';

export const TxError: FC<{ metadata: Metadata; error?: DispatchError }> = ({
  metadata,
  error,
}) => {
  if (!error) {
    return null;
  }

  const errorDesc = getDispatchError(metadata, error);

  return (
    <div>
      <h5>
        {errorDesc
          ? `${errorDesc.section}.${errorDesc.error.name}`
          : 'Unknown Reason'}
      </h5>
      <p>{errorDesc?.error.docs.join(' ')}</p>
    </div>
  );
};
