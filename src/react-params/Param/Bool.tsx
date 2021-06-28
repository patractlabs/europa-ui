// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props } from '../types';

import React, { useCallback, useRef, useState } from 'react';

import { isBoolean } from '@polkadot/util';

import { useTranslation } from '../translate';
import Bare from './Bare';
import { Radio, RadioChangeEvent } from 'antd';

function BoolParam ({ className = '', defaultValue: { value }, isDisabled, isError, label, onChange, withLabel }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [defaultValue] = useState(
    value instanceof Boolean
      ? value.valueOf()
      : isBoolean(value)
        ? value
        : false
  );

  const options = useRef([
    { text: t<string>('No'), value: false },
    { text: t<string>('Yes'), value: true }
  ]);

  const _onChange = useCallback(
    (e: RadioChangeEvent) =>
      onChange && onChange({
        isValid: true,
        value: e.target.value
      }),
    [onChange]
  );

  return (
    <Bare className={className}>
      <Radio.Group disabled={isDisabled} defaultValue={defaultValue} onChange={_onChange}>
        <Radio value={options.current[0].value}>{options.current[0].text}</Radio>
        <Radio value={options.current[1].value}>{options.current[1].text}</Radio>
      </Radio.Group>
    </Bare>
  );
}

export default React.memo(BoolParam);
