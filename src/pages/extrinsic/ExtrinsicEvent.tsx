import { FC, ReactElement, useState } from 'react';
import styled from 'styled-components';
import type { EventRecord } from '@polkadot/types/interfaces/system';
import MoreSvg from '../../assets/imgs/more.svg';
import { Style } from '../../shared/styled/const';

const Event = styled.div`
  border-bottom: 1px solid ${Style.color.border};
`;
const InfoLine = styled.div`
  cursor: pointer;
  display: flex;
  height: 48px;
  justify-content: space-between;
  align-items: center;
  padding: 0px 20px;
  color: ${Style.color.label.primary};
`;
const DetailToggle = styled.div`
  user-select: none;
  display: flex;
  align-items: center;

  > span {
    color: #B19E83;
    margin-right: 4px;
  }
`;
const Detail = styled.div`
  background: #EEECE9;
  padding: 20px 21px;
`;
const DetailLine = styled.div`

`;
const DetailTitle = styled.div`

`;
const DetailContent = styled.div`

`;

export const ExtrinsicEvent: FC<{ event: EventRecord }> = ({ event }): ReactElement => {
  const [ expanded, setExpanded ] = useState(false);

  console.log('event', event.event.toHuman());

  return (
    <Event>
      <InfoLine onClick={() => setExpanded(!expanded)}>
        <span>{event.event.section.toString()}.{event.event.method.toString()}</span>
        <DetailToggle>
          <span>
            Details
          </span>
          <img src={MoreSvg} alt="" style={{ transform: expanded ? 'scaleY(-1)' : '' }} />
        </DetailToggle>
      </InfoLine>
      {
        expanded &&
          <Detail>
            {
              event.event.data.map(value =>
                <DetailLine key={value.hash.toString()}>
                  <DetailTitle>{}</DetailTitle>
                  <DetailContent>{value.toString()}</DetailContent>
                </DetailLine>
              )
            }
          </Detail>
      }
    </Event>
  );
};