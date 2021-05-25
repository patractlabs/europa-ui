import { FC, ReactElement, useMemo } from 'react';
import styled from 'styled-components';
import store from '../../core/store/store';
import { Constructor } from './Constructor';

const Wrapper = styled.div`
  background-color: white;
  display: flex;
  justify-content: center;
`;
const Form = styled.div`
  width: 480px;
`;

export const Deploy: FC<{ hash: string }> = ({ hash }): ReactElement => {

  const abi = useMemo(() => {
    store.loadAll();
    return store.getCode(hash)?.contractAbi;
  }, [hash]);

  return (
    <Wrapper>
      {
        !abi ? 'Please upload the ABI first' :
          <Form>
            <Constructor abiMessages={abi.constructors} />
            
          </Form>
      }
    </Wrapper>
  );
};
