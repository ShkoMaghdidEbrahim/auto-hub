import { lazy } from 'react';
import { MdSpaceDashboard, MdSwapHoriz, MdAssignment } from 'react-icons/md';
import { FaUsersGear } from 'react-icons/fa6';
import { FaListOl } from 'react-icons/fa';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const NaqllGumrg = lazy(() => import('./pages/NaqllGumrg.jsx'));
const TarqimMrur = lazy(() => import('./pages/TarqimMrur.jsx'));
const Users = lazy(() => import('./pages/Users.jsx'));
const PredefinedValues = lazy(() => import('./pages/PredefinedValues.jsx'));

const routes = [
  {
    key: 1,
    path: '/',
    component: Dashboard,
    icon: <MdSpaceDashboard style={{ fontSize: 20 }} />,
    label: 'dashboard',
    permission: 'Dashboard',
    show: true
  },
  {
    key: 2,
    path: '/naqll-gumrg',
    component: NaqllGumrg,
    icon: <MdSwapHoriz style={{ fontSize: 20 }} />,
    label: 'naqll_gumrg',
    permission: 'NaqllGumrg',
    show: true
  },
  {
    key: 3,
    path: '/tarqim-mrur',
    component: TarqimMrur,
    icon: <MdAssignment style={{ fontSize: 20 }} />,
    label: 'tarqim_mrur',
    permission: 'TarqimMrur',
    show: true
  },
  {
    key: 4,
    path: '/predefined-values',
    component: PredefinedValues,
    icon: <FaListOl style={{ fontSize: 20 }} />,
    label: 'predefined_values',
    permission: 'PredefinedValues',
    show: true
  },
  {
    key: 10,
    path: '/users',
    component: Users,
    icon: <FaUsersGear style={{ fontSize: 20 }} />,
    label: 'users',
    permission: 'Dashboard', // Temporarily use existing permission
    show: true
  }
];

export default routes;
