import React, { FC, ReactElement, useMemo } from 'react';
import { Switch, Link, Route, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PaginationProvider } from '../../core';
import { Style } from '../../shared';
import { ExtrinsicDetail } from './Detail';
import { ExtrinsicEvents } from './Events';

const Wrapper = styled.div`
`;
const Content = styled.div`
  padding: 20px;
`;

const TabArea = styled.div`
  height: 48px;
  padding-top: 8px;
  background: linear-gradient(90deg, ${Style.color.button.primary} 0%, ${Style.color.primary} 100%);
  color: white;
`;

const Tabs = styled.div`
  padding: 0px 68px;
  display: flex;
  
  >.active {
    background-color: white;
  }

  .active a {
    color: ${Style.color.primary};
;
  }
`;

const Tab = styled.div`
  width: 133px;
  text-align: center;
  line-height: 40px;
  font-size: 16px;
  

  a {
    color: white; 
  }
`;

enum ActiveTab {
  details = 'details',
  events = 'events',
  state = 'state',
}

export const ExtrinsicDetailPage: FC = (): ReactElement => {
  const { hash, part } = useParams<{ part: string, hash: string }>();
  const tabs = useMemo(() => {
    return [
      {
        tab: ActiveTab.details,
        title: 'Details',
        link: `/extrinsic/${hash}/details`,
        path: '/extrinsic/:hash/details',
      },
      {
        tab: ActiveTab.events,
        title: 'Events',
        link: `/extrinsic/${hash}/events`,
        path: '/extrinsic/:hash/events',
      },
      {
        tab: ActiveTab.state,
        title: 'State',
        link: `/extrinsic/${hash}/state`,
        path: '/extrinsic/:hash/state',
      }
    ]
  }, [hash]);

  return (
    <Wrapper>
      <TabArea>
        <Tabs>
          {
            tabs.map(tab =>
              <Tab key={tab.tab} className={ tab.tab === part ? 'active' : ''}>
                <Link to={tab.link}>
                  {tab.title}
                </Link>
              </Tab>
            )
          }
        </Tabs>
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
              <div>{tabs[2].title}</div>
            </PaginationProvider>
          </Route>
        </Switch>
      </Content>
    </Wrapper>
  );
};
