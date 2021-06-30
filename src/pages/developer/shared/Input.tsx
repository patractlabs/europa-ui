import styled from 'styled-components';

const Input = styled.div`
  display: flex;

  > .selection {
    flex: 1;
  }
  > .button {
    margin-left: 16px;
    height: 48px;
    display: flex;
    align-items: center;

    img {
      cursor: pointer;
      width: 40px;
      height: 40px;
    }   
  }
`;

export default Input;