import styled from 'styled-components';
import { Style } from '../../../shared';

const LabeledInput = styled.div<{ error?: boolean }>`
  border: 1px solid ${props => props.error ? Style.color.border.error : Style.color.border.default};
  height: 48px;
  padding: 4px 16px;
  background-color: ${props => props.error ? Style.color.bg.error : Style.color.bg.default};

  > .span {
    height: 16px;
    font-size: 12px;
    color: ${Style.color.label.default};
    padding-right: 4px;
    line-height: 16px;
  }

  > .value {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${Style.color.label.primary};
  }
`;

export default LabeledInput;