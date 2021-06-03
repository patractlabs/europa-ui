import styled from 'styled-components';
import { Style } from './const';

export const TitleWithBottomBorder = styled.div`
  padding-bottom: 20px;
  border-bottom: 1px solid ${Style.color.border.default};
  
  >.label-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;