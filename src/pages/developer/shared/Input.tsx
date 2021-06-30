import styled from 'styled-components';

const Input = styled.div`
  display: flex;

  > .selection {
    flex: 1;
    width: 0;

    > .params {
      padding-top: 20px;
    }
  }
  > .button {
    margin-left: 16px;
    display: flex;
    align-items: flex-start;
    padding-top: 4px;

    img {
      cursor: pointer;
      width: 40px;
      height: 40px;
    }   
  }
`;

export default Input;