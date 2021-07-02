import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import MoreSvg from '../../assets/imgs/more.svg';
import { Style } from '../styled/const';
import { Args, Obj } from './Args';
import { ApiContext } from '../../core';

const Wrapper = styled.div`
  border-bottom: 1px solid ${Style.color.border.default};
`;
const InfoLine = styled.div`
  cursor: pointer;
  display: flex;
  height: 50px;
  justify-content: space-between;
  align-items: center;
  padding: 0px 20px;
  color: ${Style.color.label.primary};

  > .event-name {
    width: 50%;
    font-weight: 600;
  }
  > .index {
    width: 30%;
  }
  > .togglo-detail {
    width: 20%;
    user-select: none;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    
    > span {
      color: ${Style.color.primary};
      margin-right: 4px;
    }
  }
`;

const Detail = styled.div`
  background: ${Style.color.bg.second};
  padding: 20px 21px;
`;

export interface ExtendedEventRecord extends EventRecord {
  blockHeight?: number;
  indexInBlock?: number;
};

export const Event: FC<{ event: ExtendedEventRecord, showIndex?: boolean }> = ({ event, showIndex = false }): ReactElement => {
  const [ expanded, setExpanded ] = useState(false);
  const { metadata } = useContext(ApiContext);

  const args = useMemo(() => {
    type Module = {
      name: string;
      events: {
        name: string;
        args: string[];
        documantion: string;
      }[];
    };

    let modules: Module[] = [];

    try {
      modules = (metadata.toJSON().metadata as any)['v13'].modules as Module[];
    } catch (e) {}

    return event.event.data.map((value, index) => {
      const args = modules.find(module => module.name.toLowerCase() === event.event.section.toLowerCase())?.events
        .find(_event => _event.name.toLowerCase() === event.event.method.toLowerCase())?.args || [];

      return {
        [args[index] ? args[index] : `${index}`]: value.toJSON(),
      } as unknown as Obj;
    });
  }, [metadata, event.event]);

  return (
    <Wrapper>
      <InfoLine onClick={() => setExpanded(!expanded)}>
        <div className="event-name">{event.event.section.toString()}.{event.event.method.toString()}</div>
        {
          showIndex &&
            <div className="index">{event.blockHeight} - {event.indexInBlock}</div>
        }
        <div className="togglo-detail">
          <span>
            Details
          </span>
          <img src={MoreSvg} alt="" style={{ transform: expanded ? 'scaleY(-1)' : '' }} />
        </div>
      </InfoLine>
      {
        expanded &&
          <Detail>
            <Args args={args} />
          </Detail>
      }
    </Wrapper>
  );
};