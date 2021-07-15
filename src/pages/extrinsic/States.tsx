import React, { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ApiContext, BlocksContext, ExtendedExtrinsic } from '../../core';
import { Args, Obj } from '../../shared';
import { Toggle } from '../../react-components';

const Wrapper = styled.div`
  padding: 20px;

  > .toggle {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    > span {
      margin-left: 8px;
    }
  }
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

const ChildMutations = [
  'PutChild',
  'KillChild',
  'ClearChildPrefix',
];

export const States: FC<{ hash: string }> = ({ hash }): ReactElement => {
  const { blocks } = useContext(BlocksContext);
  const { wsProvider } = useContext(ApiContext);
  const [ mutations, setMutations ] = useState<Obj[]>([]);
  const [ onlyChild, setOnlyChild ] = useState(false);

  const extrinsic = useMemo(() => 
    blocks.reduce((extrinscis: ExtendedExtrinsic[], curr) => extrinscis.concat(curr.extrinsics), [])
      .find(extrinsic => extrinsic.hash.toString() === hash),
    [hash, blocks],
  );

  const filteredMutations = useMemo(() => {
    if (!onlyChild) {
      return [...mutations];
    }
    
    return mutations.filter(mutation => Object.keys(mutation).find(key => ChildMutations.includes(key)));
  }, [mutations, onlyChild]);

  useEffect(() => {
    if (!extrinsic) {
      return;
    }

    wsProvider.send('europa_extrinsicStateChanges', [
      extrinsic.height, extrinsic.indexInBlock      
    ]).then((mutations: StateMutation[]) => {
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
      <div className="toggle">
        <Toggle value={onlyChild} onChange={() => setOnlyChild(show => !show)}  />
        <span>Show Only Child State</span>
      </div>
      {
        filteredMutations.map((mutation, index) =>
          <Args key={index} args={mutation} withoutBottom={index !== filteredMutations.length - 1} />
        )
      }     
    </Wrapper>
  );
};
