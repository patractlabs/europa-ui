import styled from 'styled-components';
import { Style } from '../../../shared';

const LabeledInput = styled.div<{ error?: boolean }>`
  border: 1px solid ${props => props.error ? Style.color.border.error : Style.color.border.default};
  height: 48px;
  padding: 4px 16px;
  padding-right: 0px;

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
    color: ${props => props.error ? Style.color.label.error : Style.color.label.primary};
  }
  .ant-input {
    padding-left: 0px;
    height: 24px;
    border: none;
    box-shadow: none;
    outline: none;
  }
    
  .ant-select {
    width: 100%;
  
    .ant-select-arrow {
      width: 16px;
      height: 16px;
      top: 42%;
    }
    .ant-select-selector {
      padding: 0px;
      height: 16px;

      > .ant-select-selection-item {
        height: 16px;
        opacity: 1;
        font-size: 14px;
        font-weight: 500;
        color: ${Style.color.label.primary};
        line-height: 16px;
      }
    }
  }
`;

export default LabeledInput;