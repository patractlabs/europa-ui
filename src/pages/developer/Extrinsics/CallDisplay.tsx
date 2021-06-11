import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ApiContext } from '../../../core';
import { Args, Obj } from '../../../shared';
import { Enum, getTypeDef, GenericCall } from '@polkadot/types';
import type { Codec, IExtrinsic, IMethod, TypeDef } from '@polkadot/types/types';
import type { ExtrinsicSignature } from '@polkadot/types/interfaces';

const Wrapper = styled.div`
  padding: 20px;
`;
interface Param {
  name: string;
  type: TypeDef;
}

interface Value {
  isValid: boolean;
  value: Codec;
}
interface Extracted {
  hash: string | null;
  params: Param[];
  signature: string | null;
  signatureType: string | null;
  values: Value[];
}

function isExtrinsic (value: IExtrinsic | IMethod): value is IExtrinsic {
  return !!(value as IExtrinsic).signature;
}

// This is no doubt NOT the way to do things - however there is no other option
function getRawSignature (value: IExtrinsic): ExtrinsicSignature | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (value as any)._raw?.signature?.multiSignature as ExtrinsicSignature;
}
function extractState (value: IExtrinsic | IMethod, withHash?: boolean, withSignature?: boolean): Extracted {
  const params = GenericCall.filterOrigin(value.meta).map(({ name, type }): Param => ({
    name: name.toString(),
    type: getTypeDef(type.toString())
  }));
  const values = value.args.map((value): Value => ({
    isValid: true,
    value
  }));
  const hash = withHash
    ? value.hash.toHex()
    : null;
  let signature: string | null = null;
  let signatureType: string | null = null;

  if (withSignature && isExtrinsic(value) && value.isSigned) {
    const raw = getRawSignature(value);

    signature = value.signature.toHex();
    signatureType = raw instanceof Enum
      ? raw.type
      : null;
  }

  return { hash, params, signature, signatureType, values };
}

export const CallDisplay: FC<{ value: IExtrinsic | IMethod }> = ({ value }): ReactElement => {
  const [ params, setParams] = useState<Obj[]>([]);

  useEffect(() => {
    const { params, values } = extractState(value);
    setParams(params.map((p, index) => ({
      [p.name]: values[index].value.toHuman(),
    })) as Obj[]);
  }, [value]);

  return (
    <Wrapper>
      <Args args={params} />
    </Wrapper>
  );
};
