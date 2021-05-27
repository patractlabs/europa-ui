// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Codec } from '@polkadot/types/types';
import type { Props } from './types';

import React, { useCallback, useState } from 'react';


import Bare from './Bare';
import { Input } from 'antd';

function Raw ({ className = '', defaultValue: { value }, isDisabled, isError, label, onChange, onEnter, onEscape, withLabel }: Props): React.ReactElement<Props> {
  const [isValid, setIsValid] = useState(false);

  const _onChange = useCallback(
    (value: string): void => {
      const isValid = value.length !== 0;

      onChange && onChange({
        isValid,
        value
      });
      setIsValid(isValid);
    },
    [onChange]
  );

  const defaultValue = value
    ? ((value as { toHex?: () => unknown }).toHex ? (value as Codec).toHex() : value)
    : '';

  return (
    <Bare className={className}>
      <Input placeholder="raw" />
    </Bare>
  );
}

export default React.memo(Raw);
