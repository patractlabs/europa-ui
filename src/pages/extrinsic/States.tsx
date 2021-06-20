import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ApiContext, BlocksContext, Extrinsic } from '../../core';

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
    ]).then(a => {
      console.log('aaa', a);
    }, (e: any) => {
      console.log('e', e);
    });
  }, [extrinsic, wsProvider]);

  return (
    <Wrapper>
      
    </Wrapper>
  );
};
