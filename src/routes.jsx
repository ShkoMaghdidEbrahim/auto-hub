import { lazy } from 'react';
import {  MdSpaceDashboard } from 'react-icons/md';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));

const routes = [
  {
    key: 1,
    path: '/',
    component: Dashboard,
    icon: (
      <MdSpaceDashboard
        style={{
          fontSize: 20
        }}
      />
    ),
    label: 'dashboard',
    show: true
  },
];
export default routes;
