import styled from 'styled-components';
import { Style } from '../../../shared';

const Encoded = styled.div`
  border: 1px solid ${Style.color.border.default};
  padding: 6px 8px;

  > span {
    color: ${Style.color.label.default};
  }
  
  > p {
    color: ${Style.color.label.primary};
    overflow-wrap: anywhere;
  }
`;

export default Encoded;