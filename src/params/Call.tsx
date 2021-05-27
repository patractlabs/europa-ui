// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Extrinsic } from '@polkadot/types/interfaces';
import type { Props } from './types';

import React from 'react';


import Bare from './Bare';
import Unknown from './Unknown';
import { Input } from 'antd';

function CallDisplay (props: Props): React.ReactElement<Props> {
  const { className = '', defaultValue: { value }, isDisabled, label, withLabel } = props;

  if (!isDisabled) {
    return (
      <Unknown {...props} />
    );
  }

  const call = value as Extrinsic;
  const { method, section } = call.registry.findMetaCall(call.callIndex);

  return (
    <Bare>
      {/* <Static
        className={`${className} full`}
        label={label}
        withLabel={withLabel}
      >
        {section}.{method}
      </Static>
      <Call value={call} /> */}
      <Input placeholder="call" />
    </Bare>
  );
}

export default React.memo(CallDisplay);
