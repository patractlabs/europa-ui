import { Button, Modal } from 'antd';
import React, { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
`;

export const UploadContract: FC<{
  onCancel: () => void;
  onCompleted: () => void;
  show: boolean;
}> = ({ onCancel, onCompleted, show }): ReactElement => {
  const [ showUpload, toggleUpload ] = useState(false);


  return (
    <Modal visible={show} onCancel={onCancel}>
        asdf
    </Modal>
  );
};
