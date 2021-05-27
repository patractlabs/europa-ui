// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamDef, Props, RawParam } from './types';

import React, { useCallback, useEffect, useState } from 'react';

import { isUndefined } from '@polkadot/util';
import { Input } from 'antd';


function generateParam ([{ name, type }]: ParamDef[], index: number): ParamDef {
  return {
    name: `${index}: ${name || type.type}`,
    type
  };
}

function Vector ({ className = '', defaultValue, isDisabled = false, label, onChange, overrides, registry, type, withLabel }: Props): React.ReactElement<Props> | null {
  // const { t } = useTranslation();
  // const inputParams = useParamDefs(registry, type);
  const [count, setCount] = useState(0);
  const [params, setParams] = useState<ParamDef[]>([]);
  const [values, setValues] = useState<RawParam[]>([]);

  // when our values has changed, alert upstream
  useEffect((): void => {
    onChange && onChange({
      isValid: values.reduce((result: boolean, { isValid }) => result && isValid, true),
      value: values.map(({ value }) => value)
    });
  }, [values, onChange]);

  const _rowAdd = useCallback(
    (): void => setCount((count) => count + 1),
    []
  );
  const _rowRemove = useCallback(
    (): void => setCount((count) => count - 1),
    []
  );

  return (
    <Input placeholder="votethreshold" />

  );
}

export default React.memo(Vector);
