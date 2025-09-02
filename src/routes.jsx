import { lazy } from 'react';
import { 
  MdSpaceDashboard, 
  MdSwapHoriz,
  MdAssignment,
} from 'react-icons/md';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const NaqllGumrg = lazy(() => import('./pages/NaqllGumrg.jsx'));
const TarqimMrur = lazy(() => import('./pages/TarqimMrur.jsx'));

const routes = [
  {
    key: 1,
    path: '/',
    component: Dashboard,
    icon: <MdSpaceDashboard style={{ fontSize: 20 }} />,
    label: 'dashboard',
    show: true
  },
  {
    key: 2,
    path: '/naqll_gumrg',
    component: NaqllGumrg,
    icon: <MdSwapHoriz style={{ fontSize: 20 }} />,
    label: 'naqll_gumrg',
    show: true
  },
  {
    key: 3,
    path: '/tarqim_mrur',
    component: TarqimMrur,
    icon: <MdAssignment style={{ fontSize: 20 }} />,
    label: 'tarqim_mrur',
    show: true
  },
];

export default routes;