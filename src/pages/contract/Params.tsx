// Copyright 2017-2021 @polkadot/app-contracts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RawParams } from '../../react-params/types';
import type { Registry, TypeDef } from '@polkadot/types/types';
import React, { useEffect, useState } from 'react';
import UIParams from '../../react-params';

interface Props {
  isDisabled?: boolean;
  params?: ParamDef[] | null | '';
  onChange: (values: RawParams) => void;
  onEnter?: () => void;
  registry: Registry;
}

interface ParamDef {
  name: string;
  type: TypeDef;
}

function Params ({ isDisabled, onChange, onEnter, params: propParams, registry }: Props): React.ReactElement<Props> | null {
  const [params, setParams] = useState<ParamDef[]>([]);

  useEffect((): void => {
    propParams && setParams(propParams);
  }, [propParams]);

  if (!params.length) {
    return null;
  }

  return (
    <UIParams
      isDisabled={isDisabled}
      onChange={onChange}
      onEnter={onEnter}
      params={params}
      registry={registry}
    />
  );
}

export default React.memo(Params);
