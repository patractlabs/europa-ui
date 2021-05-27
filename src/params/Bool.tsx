// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props } from './types';

import React, { useCallback, useRef, useState } from 'react';


import Bare from './Bare';
import { Input } from 'antd';

function BoolParam ({ className = '', defaultValue: { value }, isDisabled, isError, label, onChange, withLabel }: Props): React.ReactElement<Props> {

  return (
    <Bare className={className}>
      {/* <Dropdown
        className='full'
        defaultValue={defaultValue}
        isDisabled={isDisabled}
        isError={isError}
        label={label}
        onChange={_onChange}
        options={options.current}
        withEllipsis
        withLabel={withLabel}
      /> */}
      <Input placeholder="bool" />
    </Bare>
  );
}

export default React.memo(BoolParam);
