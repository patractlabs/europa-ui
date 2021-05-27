// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DispatchError } from '@polkadot/types/interfaces';
import type { Props as BaseProps } from './types';

import React, { useEffect, useState } from 'react';


import Static from './Static';
import Unknown from './Unknown';
import { Input } from 'antd';

interface Details {
  details?: string | null;
  type?: string;
}

interface Props extends BaseProps {
  childrenPre?: React.ReactNode;
}

function isDispatchError (value?: unknown): value is DispatchError {
  return !!(value && ((value as DispatchError).isModule || (value as DispatchError).isToken));
}

function ErrorDisplay (props: Props): React.ReactElement<Props> {
 
  return (
    <Static {...props}>
      <Input placeholder="dispatcherror" />
    </Static>
  );
}

export default React.memo(ErrorDisplay);
