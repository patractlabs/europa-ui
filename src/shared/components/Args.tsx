import { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { Style } from '../styled/const';

const Wrapper = styled.div<{ isChild: boolean; withoutBottom: boolean }>`
  border: ${props => props.isChild ? '' : '1px solid ' + Style.color.button.primary};
  border-bottom-width: ${props => props.isChild || props.withoutBottom ? '0px' : '1px' };
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div<{ hasChild: boolean }>`
  display: flex;

  > .key {
    padding: 20px;
    border-right: 1px solid ${Style.color.button.primary};
    display: flex;
    align-items: center;
    width: 20%;
    max-width: 200px;
    min-width: 70px;

    > span {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  > .value {
    padding: ${props => props.hasChild ? '0px' : '20px'};
    overflow: hidden;
    flex: 1;
    white-space: nowrap;
    line-height: 100%;
    flex-direction: column;
    display: flex;
  }
  > .raw-value {
    justify-content: center;
    
    > span {
      text-overflow: ellipsis;
      height: 100%;
      line-height: 22px;
      overflow: hidden;
    }
  }
`;

export interface Obj {
  [key: string]: string | number | boolean | null | Obj[] | Obj;
}

const isComplexed = (value: any): boolean => {
  return typeof value === 'object' && value !== null;
};

const Arg: FC<{ isLast?: boolean; arg: Obj; index: number; }> = ({ arg, isLast = false, index }): ReactElement => {
  return (
    <div style={{ borderBottom: isLast ? '0px' : `1px solid ${Style.color.button.primary}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {
        arg instanceof Array ? 
          <Item hasChild={true}>
            <div className="key">{index}</div>
            <div className="value">{
              <Args args={arg} isChild={true} />
            }</div>
          </Item>
          :
          isComplexed(arg) ?
            Object.keys(arg).map(key =>
              <Item key={key} hasChild={isComplexed(arg[key])} style={{ flex: 1 }}>
                <div className="key"><span>{key}</span></div>
                <div className={ isComplexed(arg[key]) ? 'value' : 'value raw-value' }>{
                  isComplexed(arg[key]) ? <Args isChild={true} args={arg[key] as Obj} /> : <span>{`${arg[key]}`}</span>
                }</div>
              </Item>
            )
            :
            <Item hasChild={false}>
              <div className="key"><span>{index}</span></div>
              <div className="value raw-value">{
                <span>{`${arg}`}</span>
              }</div>
            </Item>

      }
    </div>
  );
};

export const Args: FC<{ args: Obj[] | Obj, isChild?: boolean, withoutBottom?: boolean }> = ({ args, isChild = false, withoutBottom = false }): ReactElement => {
  const argArray: Obj[] = args instanceof Array ?
    args as Obj[] :
    Object.keys(args).map(key =>
      ({
        [key]: (args as Obj)[key]
      })
    );

  return (
    <Wrapper isChild={isChild} withoutBottom={withoutBottom}>
      {
        argArray.map((arg, index) =>
          <div style={{ flex: 1 }} key={index}>
            <Arg arg={arg} index={index} isLast={index === (argArray.length - 1)} />
          </div>
        )
      }
    </Wrapper>
  );
};