import { ContractRx } from '@polkadot/api-contract';
import React, { FC, useMemo, ReactElement, useContext, useState } from 'react';
import styled from 'styled-components';
import { useContracts, store, ApiContext, BlocksContext } from '../../core';
import { Tabs } from '../../shared';
import { Message } from './Message';

const Wrapper = styled.div`
  padding: 20px;
  background-color: white;
`;

enum Section {
  Read = 'Read',
  Execute = 'Execute',
}

export const Functions: FC<{ show: boolean, contractAddress: string }> = ({ show, contractAddress }): ReactElement => {
  const { api } = useContext(ApiContext);
  const { blocks } = useContext(BlocksContext);
  const { contracts } = useContracts(api, blocks);
  const [ section, setSection ] = useState<Section>(Section.Read);

  const abi = useMemo(() => {
    store.loadAll();
    const codeHash = contracts.find(contract => contract.address === contractAddress)?.codeHash;
    if (codeHash) {
      return store.getCode(codeHash)?.contractAbi;
    }
  }, [contractAddress, contracts]);

  const messages = useMemo(() =>
    abi?.messages.filter(message =>
      (!message.isMutating && section === Section.Read) || (message.isMutating && section === Section.Execute)
    ) || [],
    [abi, section]
  );

  const contract = useMemo(() => {
    if (!abi) {
      return;
    }
    return new ContractRx(api, abi, contractAddress);
  }, [api, abi, contractAddress]);

  return (
    <Wrapper style={{ display: show ? 'block' : 'none' }}>
      {
        (!abi || !contract) &&
          'Please upload ABI'
      }
      {
        abi && contract &&
          <div>
            <Tabs
              style={{ marginBottom: '20px' }}
              options={[
                { value: Section.Read, name: Section.Read, },
                { value: Section.Execute, name: Section.Execute, }
              ]} onChange={value => setSection(value)} />
            
            {
              messages.map((message, index) =>
                <Message key={message.identifier} contract={contract} message={message} index={index + 1} />
              )
            }
          </div>
      }
    </Wrapper>
  );
};
