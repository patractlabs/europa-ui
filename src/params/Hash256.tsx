// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props } from './types';

import React, { useCallback, useState } from 'react';

import { u8aToHex } from '@polkadot/util';

import { Input } from 'antd';

function Hash256 ({ className = '', defaultValue, isDisabled, isError, isInOption, label, name, onChange, onEnter, onEscape, registry, type, withLabel }: Props): React.ReactElement<Props> {
 
  return (
    <div className={className}>
     <Input placeholder="hash256" />
    </div>
  );
}

export default React.memo(Hash256);
