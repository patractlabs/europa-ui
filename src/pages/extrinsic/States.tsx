import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ApiContext, BlocksContext, Extrinsic } from '../../core';
import { Args, Obj } from '../../shared';

const Wrapper = styled.div`
  padding: 20px;
`;

interface StateMutation {
  type: 'Put' | 'PutChild' | 'KillChild' | 'ClearPrefix' | 'ClearChildPrefix' | 'Append';

  data: {
    value: string;
    child_id: string;
    prefix: string;
    key: string;
    append: string;
  };
}
type ExtendedExtrinsic = Extrinsic & {
  height: number;
  index: number;
};

export const States: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { wsProvider } = useContext(ApiContext);
  const [ mutations, setMutations ] = useState<Obj[]>([]);

  const extrinsic: ExtendedExtrinsic | undefined = useMemo(() => {
    let _extrinsic: ExtendedExtrinsic | undefined;
    
    blocks.find(_block => {
      const index = _block.extrinsics.findIndex(extrinsic => extrinsic.hash.toString() === hash);

      if (index < 0) {
        return false;
      }

      _extrinsic =  Object.assign(_block.extrinsics[index], {
        height: _block.height,
        index,
      });

      return true;
    });

    return _extrinsic;
  }, [hash, blocks]);

  useEffect(() => {
    if (!extrinsic) {
      return;
    }

    wsProvider.send('europa_extrinsicStateChanges', [
      extrinsic.height, extrinsic.index      
    ]).then((mutations: StateMutation[]) => {
      console.log('mutations', mutations);

      setMutations(
        mutations.map(mutation => ({
          [mutation.type]: mutation.data
        }))
      );

    }, (e: any) => {
      console.log('e', e);
      setMutations([]);
    });
  }, [extrinsic, wsProvider]);

  return (
    <Wrapper>
      {
        mutations.map((mutation, index) =>
          <Args key={index} args={mutation} />
        )
      }     
    </Wrapper>
  );
};
