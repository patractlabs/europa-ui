// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props } from './types';

import React from 'react';

import { Input } from 'antd';

function Hash512 ({ className = '', defaultValue, isDisabled, isError, label, name, onChange, onEnter, onEscape, type, withLabel }: Props): React.ReactElement<Props> {
  return (
    <Input placeholder="hash512" />
  );
}

export default React.memo(Hash512);
