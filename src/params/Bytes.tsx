// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props } from './types';

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { compactAddLength } from '@polkadot/util';

import { Input } from 'antd';

function Bytes ({ className = '', defaultValue, isDisabled, isError, label, name, onChange, onEnter, onEscape, type, withLabel }: Props): React.ReactElement<Props> {
  return (
    <div className={className}>
      {/* {!isDisabled && isFileDrop
        ? (
          <File
            isDisabled={isDisabled}
            isError={isError || !isValid}
            label={label}
            onChange={_onChangeFile}
            withLabel={withLabel}
          />
        )
        : (
          <BaseBytes
            defaultValue={defaultValue}
            isDisabled={isDisabled}
            isError={isError}
            label={label}
            length={-1}
            name={name}
            onChange={onChange}
            onEnter={onEnter}
            onEscape={onEscape}
            type={type}
            withLabel={withLabel}
            withLength
          />
        )
      }
      {!isDisabled && (
        <Toggle
          isOverlay
          label={t<string>('file upload')}
          onChange={setFileInput}
          value={isFileDrop}
        />
      )} */}
      <Input placeholder="bytes" />
    </div>
  );
}

export default React.memo(styled(Bytes)`
  position: relative;
`);
