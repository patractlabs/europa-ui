import { FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import { Block, ApiContext } from '../../core';
import { Args, Obj } from '../../shared';
import { from, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { Toggle } from '../../react-components';
import styled from 'styled-components';

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

const States: FC<{ block: Block; className?: string }> = ({ block, className }): ReactElement => {
  const [ mutations, setMutations ] = useState<Obj[]>([]);
  const { wsProvider } = useContext(ApiContext);
  const [ onlyChild, setOnlyChild ] = useState(false);

  const filteredMutations = useMemo(() => {
    if (!onlyChild) {
      return [...mutations];
    }
    console.log('Object.keys(mutation)', mutations.map(mutation => Object.keys(mutation)));
    
    return mutations.filter(mutation => Object.keys(mutation).find(key => ChildMutations.includes(key)));
  }, [mutations, onlyChild]);

  useEffect(() => {
    const sub = zip(
      ...block.extrinsics.map((_, index) =>
        from(wsProvider.send('europa_extrinsicStateChanges', [block.height, index]))
      )
    )
      .pipe(
        map((results: StateMutation[][]) =>
          results.reduce((all, curr) => all.concat(curr), [])
        )
      )
      .subscribe(mutations => {
        setMutations(
          mutations.map(mutation => ({
            [mutation.type]: mutation.data
          }))
        );

      }, (e: any) => {
        console.log('e', e);
        setMutations([]);
      });
    
    return () => sub.unsubscribe();
  }, [block, wsProvider]);

  return (
    <div className={className}>
      <div className="toggle">
        <Toggle value={onlyChild} onChange={() => setOnlyChild(show => !show)}  />
        <span>Show Only Child State</span>
      </div>
      {
        filteredMutations.map((mutation, index) =>
          <Args key={index} args={mutation} withoutBottom={filteredMutations.length - 1 !== index} />
        )
      }
    </div>
  )
};

export default styled(States)`
  background: white;
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
