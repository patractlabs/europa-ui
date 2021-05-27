// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TypeDef } from '@polkadot/types/types';
import type { Props } from './types';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Input } from 'antd';


function Option ({ className = '', defaultValue, isDisabled, name, onChange, onEnter, onEscape, registry, type: { sub, withOptionActive } }: Props): React.ReactElement<Props> {


  return (
    <div className={className}>
      <Input placeholder="option" />
    </div>
  );
}

export default React.memo(styled(Option)`
  position: relative;
`);
