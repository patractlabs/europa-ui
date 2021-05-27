// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props } from './types';

import BN from 'bn.js';
import React, { useCallback, useState } from 'react';


import Bare from './Bare';
import { Input } from 'antd';

function Balance ({ className = '', defaultValue: { value }, isDisabled, isError, label, onChange, onEnter, onEscape, withLabel }: Props): React.ReactElement<Props> {
  const [isValid, setIsValid] = useState(false);
  const [values, setValue] = useState('');
  const [defaultValue] = useState(() => new BN((value as BN || '0').toString()).toString(10));

  const _onChange = useCallback(
    (e): void => {
      // const isValid = !isError && !!value;

      setValue(e.target.value);
      onChange && onChange({
        isValid: true,
        value: e.target.value,
      });
      // setIsValid(isValid);
    },
    [onChange]
  );

  return (
    <Bare className={className}>
      {/* <InputBalance
        className='full'
        defaultValue={defaultValue}
        isDisabled={isDisabled}
        isError={isError || !isValid}
        label={label}
        onChange={_onChange}
        onEnter={onEnter}
        onEscape={onEscape}
        withEllipsis
        withLabel={withLabel}
      /> */}
      <Input value={values} placeholder="balance" onChange={_onChange} />
    </Bare>
  );
}

export default React.memo(Balance);

export {
  Balance
};
