// Copyright 2017-2021 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { DropDownProps } from 'antd';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import Labelled from './Labelled';

const { Option } = Select;

interface Props {
  children?: React.ReactNode;
  className?: string;
  defaultValue?: any;
  isDisabled?: boolean;
  isError?: boolean;
  label?: React.ReactNode;
  onChange?: (value: any) => void;
  options: { text: string; value: any }[];
  placeholder?: string;
  withEllipsis?: boolean;
  withLabel?: boolean;
  transform?: (value: any) => any;

}

export type IDropdown = React.ComponentType<Props> & {
  Header: React.ComponentType<{ content: React.ReactNode }>;
}

function BaseDropdown ({ children, className = '', defaultValue, isDisabled, isError, label, onChange, options, placeholder, transform, withEllipsis, withLabel }: Props): React.ReactElement<Props> {
  const lastUpdate = useRef<string>('');
  const [stored, setStored] = useState<string | undefined>();

  const _setStored = useCallback(
    (value: string): void => {
      const json = JSON.stringify({ v: value });

      if (lastUpdate.current !== json) {
        lastUpdate.current = json;

        setStored(value);

        onChange && onChange(
          transform
            ? transform(value)
            : value
        );
      }
    },
    [onChange, transform]
  );

  useEffect((): void => {
    _setStored(defaultValue);
  }, [_setStored, defaultValue]);

  const _onChange = useCallback(
    value =>
      _setStored(value as string),
    [_setStored]
  );

  const dropdown = (
    <Select
      disabled={isDisabled}
      onChange={_onChange}
      placeholder={placeholder}
      value={stored}
    >
      {
        options.map((option, index) =>
          <Option value={option.value} key={index}>{option.text}</Option>
        )
      }
    </Select>
  );

  return (
      <Labelled
        className={`ui--Dropdown ${className}`}
        label={label}
        withEllipsis={withEllipsis}
        withLabel={withLabel}
      >
        {dropdown}
        {children}
      </Labelled>
    );
}

const Dropdown = React.memo(styled(BaseDropdown)`
  .ui--Dropdown-item {
    position: relative;
    white-space: nowrap;

    .ui--Dropdown-icon,
    .ui--Dropdown-name {
      display: inline-block;
    }

    .ui--Dropdown-icon {
      height: 32px;
      left: 0;
      position: absolute;
      top: -9px;
      width: 32px;

      &.opaque {
        opacity: 0.5;
      }
    }

    .ui--Dropdown-name {
      margin-left: 3rem;
    }
  }

  .ui.selection.dropdown {
    > .text > .ui--Dropdown-item {
      .ui--Dropdown-icon {
        left: -2.6rem;
        top: -1.15rem;
        opacity: 1;
      }

      .ui--Dropdown-name {
        margin-left: 0;
      }
    }
  }
`) as unknown as IDropdown;

// (Dropdown as any).Header = SUIDropdown.Header;

export default Dropdown;
