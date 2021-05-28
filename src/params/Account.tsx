// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props } from './types';

import React, { useCallback } from 'react';
import Bare from './Bare';
import keyring from '@polkadot/ui-keyring';
import { AddressInput } from '../shared/components/AddressInput';

function Account ({ className = '', defaultValue: { value }, isDisabled, isError, isInOption, label, onChange, withLabel }: Props): React.ReactElement<Props> {
  
  const _onChange = useCallback(
    (value: string): void => {
      let isValid = false;

      if (value) {
        try {
          keyring.decodeAddress(value);

          isValid = true;
        } catch (err) {
          console.error(err);
        }
      }

      onChange && onChange({
        isValid,
        value
      });
    },
    [onChange]
  );

  return (
    <Bare clssName={className}>
      <AddressInput defaultValue={value as string} onChange={_onChange} />
    </Bare>
  );
}

export default React.memo(Account);
