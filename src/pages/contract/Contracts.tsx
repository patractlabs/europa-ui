import { Button, Modal } from 'antd';
import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { UploadContract } from './Upload';

const Wrapper = styled.div`
`;

export const Contracts: FC = (): ReactElement => {
  const [ showUpload, toggleUpload ] = useState(false);



  return (
    <Wrapper>
      <Button onClick={() => toggleUpload(true)}>Upload Contract</Button>
      <UploadContract onCancel={() => toggleUpload(false)} onCompleted={() => toggleUpload(false)} show={showUpload} />
    </Wrapper>
  );
};
