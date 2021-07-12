import { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { Block, ApiContext } from '../../core';
import { Args, Obj } from '../../shared';
import { from, zip } from 'rxjs';
import { map } from 'rxjs/operators';

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

const States: FC<{ block: Block }> = ({ block }): ReactElement => {
  const [ mutations, setMutations ] = useState<Obj[]>([]);
  const { wsProvider } = useContext(ApiContext);

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
    <div style={{ background: 'white', padding: '20px'}}>
      {
        mutations.map((mutation, index) =>
          <Args key={index} args={mutation} withoutBottom={mutations.length - 1 !== index} />
        )
      }
    </div>
  )
};

export default States;
