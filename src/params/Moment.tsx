// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props, RawParamOnChangeValue } from './types';

import React, { useCallback } from 'react';


import Amount from './Amount';
import { Input } from 'antd';

function Moment ({ className = '', defaultValue, isDisabled, isError, label, onChange, onEnter, onEscape, registry, type, withLabel }: Props): React.ReactElement<Props> {


  return (
    <Input placeholder="monent" />
  );
}

export default React.memo(Moment);
