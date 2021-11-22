import { Abi } from '@polkadot/api-contract';
import { useEffect, useState } from 'react';
import { from, zip, of, Observable } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import type * as FS from 'fs';
import type * as Path from 'path';
import { requireModule } from '../../shared';

export interface RedspotContract {
  abi: Abi;
  codeHash: string;
  name: string;
  path: string;
}

export const useRedspotContracts = (redspotProjects: string[]) => {
  const [respotContracts, setContracts] = useState<RedspotContract[]>([]);

  useEffect(() => {
    if (!requireModule.isElectron) {
      return;
    }

    const fs: typeof FS = requireModule('fs');
    const path: typeof Path = requireModule('path');

    const readObservables = redspotProjects
      .map(projectPath => path.resolve(projectPath, '../artifacts'))
      .map(dirPath =>
        from(fs.promises.readdir(dirPath)).pipe(
          map((files: string[]): Observable<RedspotContract>[] =>
            files
              .filter(name => name.endsWith('.contract'))
              .map(async file => {
                const json = (
                  await fs.promises.readFile(path.resolve(dirPath, file))
                ).toString();
                const abi = new Abi(json);
                const name = abi.project?.contract?.name?.toString();
                const hash = abi.project?.source?.wasmHash?.toString();
                const redspotContract: RedspotContract = {
                  name,
                  path: path.resolve(dirPath, file),
                  codeHash: hash,
                  abi,
                };

                return redspotContract;
              })
              .map(redspotContract => from(redspotContract))
          ),
          mergeMap(redspotProjects => zip(...redspotProjects)),
          catchError((_): Observable<RedspotContract[]> => of([]))
        )
      );

    const sub = zip(...readObservables)
      .pipe(map(results => results.reduce((all, curr) => all.concat(curr), [])))
      .subscribe(contracts => {
        setContracts(contracts);
      });

    return () => sub.unsubscribe();
  }, [redspotProjects]);

  return {
    redspotContracts: respotContracts,
  };
};
