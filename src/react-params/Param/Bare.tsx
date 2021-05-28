import React from 'react';
import styled from 'styled-components';

interface Props {
  children?: React.ReactNode;
  className?: string;
}

function Bare ({ children, className = '' }: Props): React.ReactElement<Props> {
  return (
    <div className={`ui--row ${className}`}>
      {children}
    </div>
  );
}

export default React.memo(styled(Bare)`
  position: relative;
`);
