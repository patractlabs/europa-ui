// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Props, RawParam } from './types';

import React, { useCallback } from 'react';

import { Input } from 'antd';

function StructParam (props: Props): React.ReactElement<Props> {
  
  return (
    <div className='ui--Params-Struct'>
      <Input placeholder="struct" />
    </div>
  );
}

export default React.memo(StructParam);
