// navigation/sidebar.config.js
import { ROLES } from '../permissions/roles';
import { Users, LayoutDashboard, Settings } from 'lucide-react';

export const SIDEBAR_CONFIG = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
        label: 'Users',
        path: '/users',
        icon: Users,
        roles: [ROLES.ADMIN],
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
    },
];
