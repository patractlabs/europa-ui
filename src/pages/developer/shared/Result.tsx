import React, { FC } from 'react';
import styled from 'styled-components';
import { Style } from '../../../shared';
import DeleteSvg from '../../../assets/imgs/delete-result.svg';

const Result: FC<{ className?: string; results: any[], onDelete: (index: number) => void }> = ({ className, results, onDelete }) => {
  return (
    <div className={className}>
      {
        results.map((result, index) =>
          <div className="result" key={index}>
            <div className="info">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
            <div className="button">
              <img onClick={() => onDelete(index)} src={DeleteSvg} alt="" />
            </div>
          </div>
        )
      }
    </div>
  );
};

export default styled(Result)`
margin-top: 20px;

> .result {
  margin-top: 10px;
  display: flex;

  > .info {
    border: 1px solid ${Style.color.border.default};
    padding: 16px;
    flex: 1;

    pre {
      margin-bottom: 0px;
    }
  }
  > .button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 20px;
    width: 40px;
    img {
      cursor: pointer;
      width: 40px;
      height: 40px;
    }
  }   
}
`;