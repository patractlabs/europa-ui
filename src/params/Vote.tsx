// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props } from './types';

import BN from 'bn.js';
import React, { useRef } from 'react';

import { GenericVote } from '@polkadot/types';

import Bare from './Bare';
import { Input } from 'antd';

function doChange (onChange?: (value: any) => void): (_: number) => void {
  return function (value: number): void {
    onChange && onChange({
      isValid: true,
      value
    });
  };
}

function Vote ({ className = '', defaultValue: { value }, isDisabled, isError, onChange, withLabel }: Props): React.ReactElement<Props> {


  const defaultValue = value instanceof BN
    ? value.toNumber()
    : value instanceof GenericVote
      ? (value.isAye ? -1 : 0)
      : value as number;
  const defaultConv = value instanceof GenericVote
    ? value.conviction.index
    : 0;

  return (
    <Bare className={className}>
      <Input placeholder="vote" />
    </Bare>
  );
}

export default React.memo(Vote);
