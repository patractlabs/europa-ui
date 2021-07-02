import { FC, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ApiContext } from '../../core';
import { Style } from '../../shared';

const RawData: FC<{ className?: string; codeHash?: string }> = ({ className, codeHash }) => {
  const { api } = useContext(ApiContext);
  const [ code, setCode ] = useState<string>();
  
  useEffect(() => {
    if (!codeHash) {
      return;
    }

    api.query.contracts.codeStorage(codeHash).subscribe(data => setCode(data.unwrapOr(null)?.code.toString() || ''));
  }, [codeHash, api]);

  if (!code) {
    return null;
  }
  
  return (
    <div className={className}>
      {code}
    </div>
  );
};

export default styled(RawData)`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  word-break: break-all;
  background: ${Style.color.bg.second};
  border: 1px solid ${Style.color.button.primary};
  border-radius: 4px;
`;