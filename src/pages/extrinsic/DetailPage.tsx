import React, { FC, ReactElement, useMemo } from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PaginationProvider } from '../../core';
import { PageTabs, Style } from '../../shared';
import { ExtrinsicDetail } from './Detail';
import { ExtrinsicEvents } from './Events';
import { States } from './States';

const Wrapper = styled.div`
  background-color: ${Style.color.bg.default};
  flex: 1;
  display: flex;
  flex-direction: column;
  `;

const Content = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const TabArea = styled.div`
  height: 48px;
  padding-top: 8px;
  background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
  color: white;
`;

export enum ActiveTab {
  Details = 'details',
  Events = 'events',
  State = 'state',
}

export const ExtrinsicDetailPage: FC = (): ReactElement => {
  const { hash } = useParams<{ part: string, hash: string }>();
  const tabs = useMemo(() => {
    return [
      {
        tab: ActiveTab.Details,
        title: 'Details',
        link: `/extrinsic/${hash}/details`,
        path: '/extrinsic/:hash/details',
      },
      {
        tab: ActiveTab.Events,
        title: 'Events',
        link: `/extrinsic/${hash}/events`,
        path: '/extrinsic/:hash/events',
      },
      {
        tab: ActiveTab.State,
        title: 'State',
        link: `/extrinsic/${hash}/state`,
        path: '/extrinsic/:hash/state',
      }
    ]
  }, [hash]);

  return (
    <Wrapper>
      <TabArea>
        <PageTabs options={tabs} />
      </TabArea>
      <Content>
        <Switch>
          <Route path={tabs[0].path}>
            <ExtrinsicDetail hash={hash}/>
          </Route>
          <Route path={tabs[1].path}>
            <PaginationProvider>
              <ExtrinsicEvents />
            </PaginationProvider>
          </Route>
          <Route path={tabs[2].path}>
            <PaginationProvider>
              <States hash={hash} />
            </PaginationProvider>
          </Route>
        </Switch>
      </Content>
    </Wrapper>
  );
};
