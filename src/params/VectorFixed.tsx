// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamDef, Props, RawParam } from './types';

import React, { useEffect, useState } from 'react';

import { isUndefined } from '@polkadot/util';
import { Input } from 'antd';


function generateParam ([{ name, type }]: ParamDef[], index: number): ParamDef {
  return {
    name: `${index}: ${name || type.type}`,
    type
  };
}

function VectorFixed ({ className = '', defaultValue, isDisabled = false, label, onChange, overrides, registry, type, withLabel }: Props): React.ReactElement<Props> | null {

  return (
    <Input placeholder="vectorfixed" />
  );
}

export default React.memo(VectorFixed);
