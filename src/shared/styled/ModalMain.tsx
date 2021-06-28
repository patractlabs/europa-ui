import styled from 'styled-components';
import { Style } from './const';

export const ModalMain = styled.div`
  padding: 16px 0px;
  text-align: center;
  color: ${Style.color.label.primary};

  .header h2 {
    font-size: 24px;
    font-weight: 600;
  }

  .footer {
    margin-top: 30px;
  }

  .ant-modal-close-x {
    width: 32px;
    height: 32px;
    line-height: 32px;
  }
`;