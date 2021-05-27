// Copyright 2017-2021 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Codec } from '@polkadot/types/types';
import type { RawParam } from './types';

import React from 'react';
import styled from 'styled-components';


import Bare from './Bare';

interface Props {
  asHex?: boolean;
  children?: React.ReactNode;
  childrenPre?: React.ReactNode;
  className?: string;
  defaultValue: RawParam;
  label?: React.ReactNode;
  withLabel?: boolean;
}

function StaticParam ({ asHex, children, childrenPre, className = '', defaultValue, label }: Props): React.ReactElement<Props> {


  return (
    <Bare className={className}>
      {childrenPre}
      {/* <Static
        className='full'
        label={label}
        value={<pre>{value || t<string>('<empty>')}</pre>}
      /> */}
      {children}
    </Bare>
  );
}

export default React.memo(styled(StaticParam)`
  pre {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ui--Static {
    margin-bottom: 0 !important;
  }
`);
