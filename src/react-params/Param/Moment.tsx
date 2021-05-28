import type { Props, RawParamOnChangeValue } from '../types';

import React, { useCallback } from 'react';

import { Static } from '../../react-components';

import Amount from './Amount';

function Moment ({ className = '', defaultValue, isDisabled, isError, label, onChange, onEnter, onEscape, registry, type, withLabel }: Props): React.ReactElement<Props> {
  const _onChange = useCallback(
    (value: RawParamOnChangeValue) =>
      onChange && onChange(value),
    [onChange]
  );

  if (isDisabled) {
    return (
      <Static
        className={className}
        defaultValue={
          (defaultValue && defaultValue.value)
            ? (defaultValue.value as string).toString()
            : ''
        }
        isError={isError}
        label={label}
        withLabel={withLabel}
      />
    );
  }

  return (
    <Amount
      className={className}
      defaultValue={defaultValue}
      isDisabled={isDisabled}
      isError={isError}
      label={label}
      onChange={_onChange}
      onEnter={onEnter}
      onEscape={onEscape}
      registry={registry}
      type={type}
      withLabel={withLabel}
    />
  );
}

export default React.memo(Moment);
