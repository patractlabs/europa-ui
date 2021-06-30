import styled from 'styled-components';
import { Style } from '../../../shared';

const LabeledInput = styled.div`
  border: 1px solid ${Style.color.border.default};
  height: 48px;
  padding: 4px 16px;
  padding-right: 0px;

  > .span {
    height: 16px;
    font-size: 12px;
    color: #8c8b8c;
    padding-right: 4px;
    line-height: 16px;
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