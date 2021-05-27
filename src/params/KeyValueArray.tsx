// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0


import React, { useCallback, useState } from 'react';

import { assert, isHex, u8aToString } from '@polkadot/util';

import { createParam } from './KeyValue';
import { Input } from 'antd';
import { Props } from './types';

interface Parsed {
  isValid: boolean;
  value: [Uint8Array, Uint8Array][];
}

const BYTES_TYPE = {
  info: 0,
  type: 'Bytes'
};

const EMPTY_PLACEHOLDER = 'click to select or drag and drop JSON key/value (hex-encoded) file';

function parseFile (raw: Uint8Array): Parsed {
  const json = JSON.parse(u8aToString(raw)) as Record<string, string>;
  const keys = Object.keys(json);
  let isValid = keys.length !== 0;
  const value = keys.map((key): [Uint8Array, Uint8Array] => {
    const value = json[key];

    assert(isHex(key) && isHex(value), `Non-hex key/value pair found in ${key.toString()} => ${value.toString()}`);

    const encKey = createParam(key);
    const encValue = createParam(value);

    isValid = isValid && encKey.isValid && encValue.isValid;

    return [encKey.u8a, encValue.u8a];
  });

  return {
    isValid,
    value
  };
}

function KeyValueArray ({ className = '', defaultValue, isDisabled, isError, label, onChange, onEnter, onEscape, withLabel }: Props): React.ReactElement<Props> {
  

  return (
    <Input placeholder="keyvaluearray" />
  );
}

export default React.memo(KeyValueArray);
