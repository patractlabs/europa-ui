import styled from 'styled-components';
import { Style } from './const';

export const Button = styled.button`
  height: 52px;
  border-radius: 26px;
  border-width: 0px;
  color: white;
  cursor: pointer;
  outline: none;
  font-size: 15px;
  background-color: ${Style.color.button.primary};
  font-weight: 600;
`;