import React, { useCallback, useContext, useEffect, useState } from 'react';
import { requireModule } from '../../shared';
import { EuropaManageContext } from './europa.provider';

const LogsContext: React.Context<{
  logs: string[];
  clear: () => void;
}> = React.createContext({
  logs: [],
} as any);

interface Props {
  children: React.ReactNode;
}

const LogsProvider = React.memo(({ children }: Props): React.ReactElement<Props> =>  {
  const [ logs, setLogs ] = useState<string[]>([]);
  const { europa } = useContext(EuropaManageContext);
  const clear = useCallback(() => {
    setLogs([]);
  }, []);
  
  useEffect(() => {
    if (!requireModule.isElectron) {
      setLogs([
        '2021-06-10 18:44:33  Low open file descriptor limit configured for the process. Current value: 4096, recommended value: 10000.',
        '2021-06-10 18:44:33  Europa Dev Node',
        '2021-06-10 18:44:33  ✌️  version 0.2.1-6422ea8-x86_64-linux-gnu',
        '2021-06-10 18:44:33  ❤️  by patract labs <https://github.com/patractlabs>, 2020-2021',
        '2021-06-10 18:44:33  📋 Chain specification: Development',
        '2021-06-10 18:44:33  💾 Database: RocksDb at /home/freepoix/.local/share/europa/default/chains/dev/db',
        '2021-06-10 18:44:33  📖 Workspace: default | Current workspace list: ["default"]',
        '2021-06-10 18:44:33  ⛓  Native runtime: europa-3 (europa-1.tx1.au1)',
        '2021-06-10 18:44:33  📦 Highest known block at #33',
        '2021-06-10 18:44:33  Listening for new connections on 127.0.0.1:9944.',
        '2021-06-10 18:44:34  Accepted a new tcp connection from 127.0.0.1:42598.',
        '2021-06-10 18:44:34  Accepted a new tcp connection from 127.0.0.1:42600.',
        '2021-06-10 19:22:47  Failed to submit extrinsic: Transaction pool error: Invalid transaction validity: InvalidTransaction::Payment',
        '2021-06-10 19:22:52  🙌 Starting consensus session on top of parent 0x10e1f3d59b9b785c6dd9e42751b9529215e543a869c1ae5be10e1e2867781270',
        '2021-06-10 19:22:53  Timeout fired waiting for transaction pool at block #33. Proceeding with production.',
        '2021-06-10 19:22:53  💡 this contract do not have name section part, could not support WASM backtrace or WASM debug.',
        '2021-06-10 19:22:53  🎁 Prepared block for proposing at 34 [hash: 0x9965bfc5d65b7db078be2bd70445c0b431f89654a8579911131f8b9c98c3953d; parent_hash: 0x10e1…1270; extrinsics (2): [0xbdeb…d019, 0x92cd…e047]]',
        '2021-06-10 19:22:53  Instant Seal success: CreatedBlock { hash: 0x9965bfc5d65b7db078be2bd70445c0b431f89654a8579911131f8b9c98c3953d, aux: ImportedAux { header_only: false, clear_justification_requests: false, needs_justification: false, bad_justification: false, is_new_best: true } }',
        '2021-06-10 19:23:56  🙌 Starting consensus session on top of parent 0x9965bfc5d65b7db078be2bd70445c0b431f89654a8579911131f8b9c98c3953d',
        '2021-06-10 19:23:56  🎁 Prepared block for proposing at 35 [hash: 0xcb1f1883d39fd7854c0553e03799a254d6c890540ecdb70fdf34f77d0765dec1; parent_hash: 0x9965…953d; extrinsics (2): [0x8d8d…7ae3, 0xb710…95cd]]',
        '2021-06-10 19:23:56  Instant Seal success: CreatedBlock { hash: 0xcb1f1883d39fd7854c0553e03799a254d6c890540ecdb70fdf34f77d0765dec1, aux: ImportedAux { header_only: false, clear_justification_requests: false, needs_justification: false, bad_justification: false, is_new_best: true } }',
      ]);
    
      return;
    }

    europa?.stderr.on('data', data => {
      setLogs(logs => [...logs, data.toString()]);
    });
  }, [europa]);

  return (
    <LogsContext.Provider
      value={{
        logs,
        clear,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
});

export { LogsContext, LogsProvider };
