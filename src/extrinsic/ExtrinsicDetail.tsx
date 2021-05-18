import React, { FC, ReactElement, useContext, useMemo, useState } from 'react';
import { Switch, Link, Route, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Extrinsic } from '../core/provider/blocks.provider';
import { PaginationContext, PaginationProvider } from '../core/provider/pagination.provider';
import { PageSize } from '../shared/components/PageSize';
import { PaginationR } from '../shared/components/Pagination';

const Wrapper = styled.div`
`;
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TabArea = styled.div`
  height: 48px;
  padding-top: 8px;
  background: linear-gradient(90deg, #BEAC92 0%, #B19E83 100%);
  color: white;
`;

const Tabs = styled.div`
  padding: 0px 68px;
  display: flex;
  
  >.active {
    background-color: white;
  }

  .active a {
    color: #B19E83;
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

type ExtendedExtrinsic = Extrinsic & {
  height: number;
};

enum ActiveTab {
  details = 'details',
  events = 'events',
  state = 'state',
}

export const ExtrinsicDetail: FC = (): ReactElement => {
  const [ active, setActive ] = useState<ActiveTab>(ActiveTab.details);
  const { part } = useParams<{ part: string }>();
  
  const tabs = [
    {
      tab: ActiveTab.details,
      title: 'Details',
      link: '/extrinsic/detail/details',
    },
    {
      tab: ActiveTab.events,
      title: 'Events',
      link: '/extrinsic/detail/events',
    },
    {
      tab: ActiveTab.state,
      title: 'State',
      link: '/extrinsic/detail/state',
    }
  ];

  return (
    <Wrapper>
      <TabArea>
        <Tabs>
          {
            tabs.map(tab =>
              <Tab className={ tab.tab === part ? 'active' : ''}>
                <Link to={`${tab.link}`}>
                  {tab.title}
                </Link>
              </Tab>
            )
          }
        </Tabs>
      </TabArea>
      <Switch>
        <Route path={`${tabs[0].link}`}>
          <div>{tabs[0].title}</div>
        </Route>
        <Route path={`${tabs[1].link}`}>
          <div>{tabs[1].title}</div>
        </Route>
        <Route path={`${tabs[2].link}`}>
          <div>{tabs[2].title}</div>
        </Route>
      </Switch>
        <Footer>
          <PageSize />
          <PaginationR />
        </Footer>
    </Wrapper>
  );
};
