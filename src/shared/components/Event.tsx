import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import MoreSvg from '../../assets/imgs/more.svg';
import { Style } from '../styled/const';
import { Args, Obj } from './Args';
import { ApiContext } from '../../core';

const Wrapper = styled.div`
  border-bottom: 1px solid ${Style.color.border.default};

  > .info-line {
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
  }
  > .detail {
    background: ${Style.color.bg.second};
    padding: 20px 21px;

    > .error {
      border: 1px solid ${Style.color.border.error};
      padding: 16px;
      background-color: ${Style.color.bg.error};
      margin-top: 16px;

      > h6 {
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
`;

export interface ExtendedEventRecord extends EventRecord {
  blockHeight?: number;
  indexInBlock?: number;
};

export const Event: FC<{ event: ExtendedEventRecord, showIndex?: boolean }> = ({ event, showIndex = false }): ReactElement => {
  const [ expanded, setExpanded ] = useState(false);
  const [ args, setArgs ] = useState<Obj[]>([]);
  const [ err, setErr ] = useState<{
    section: string;
    err: {
      name: string,
      documentation: string[],
    } 
  }>();

  const { metadata } = useContext(ApiContext);

  useEffect(() => {
    type Module = {
      name: string;
      events: {
        name: string;
        args: string[];
        documantion: string;
      }[];
      errors: {
        name: string,
        documentation: string[],
      }[];
    };

    let modules: Module[] = [];

    try {
      modules = (metadata.toJSON().metadata as any)['v13'].modules as Module[];
    } catch (e) {}

    const args = event.event.data.map((value, index) => {
      const args = modules.find(module => module.name.toLowerCase() === event.event.section.toLowerCase())?.events
        .find(_event => _event.name.toLowerCase() === event.event.method.toLowerCase())?.args || [];
      const errIndex = args.findIndex(arg => arg === 'DispatchError');

      if (errIndex === index) {
        const err = value.toJSON() as {
          module: {
            index: number;
            error: number;
          }
        };

        setErr({
          section: modules[err.module.index].name,
          err: modules[err.module.index].errors[err.module.error],
        });        
      }

      return {
        [args[index] ? args[index] : `${index}`]: value.toJSON(),
      } as unknown as Obj;
    });

    setArgs(args);
  }, [metadata, event.event]);

  return (
    <Wrapper>
      <div className="info-line" onClick={() => setExpanded(!expanded)}>
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
      </div>
      {
        expanded &&
          <div className="detail">
            <Args args={args} />
            {
              !!err &&
                <div className="error">
                  <h6>
                    {err?.section}.{err?.err.name}
                  </h6>
                  <p>
                    {
                      err?.err.documentation.join(' ')
                    }
                  </p>
                </div>
            }
          </div>
      }
    </Wrapper>
  );
};