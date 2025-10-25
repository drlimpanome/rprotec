import { Folder } from '@phosphor-icons/react';
import * as icon from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Newspaper } from '@phosphor-icons/react/dist/ssr';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { ListMagnifyingGlass } from '@phosphor-icons/react/dist/ssr/ListMagnifyingGlass';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

type Role = 1 | 2 | 3;
export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  newService: Newspaper,
  user: UserIcon,
  users: UsersIcon,
  list: Folder,
  ListMagnifyingGlass: ListMagnifyingGlass,
  listBullets: icon.ListBullets,
  law: icon.Scales,
  listPlus: icon.ListPlus,
  clock: icon.ClockCountdown,
  calendar: icon.CalendarDot,
  forms: icon.Table,
  relatorio: icon.FileArchive,
  home: icon.House,
} as Record<string, Icon>;

export const getNavItems = (role: Role): NavItemConfig[] => {
  const allNavItems: NavItemConfig[] = [
    { key: 'Home', title: 'Home', href: paths.home, icon: 'home' },
    { key: 'Dashboards', title: 'Dashboards', href: paths.dashboard.overview, icon: 'chart-pie' },
    {
      key: 'Consultar',
      title: 'Envio de lista',
      icon: 'newService',
      children: [
        {
          label: 'Criar Lista',
          title: 'Enviar Lista',
          icon: 'listPlus',
          href: paths.dashboard.ConsultNew,
        },
        {
          title: 'Ver listas',
          icon: 'listBullets',
          href: paths.dashboard.Consult,
          matcher: {
            type: 'startsWith',
            href: '/dashboard/logistic/visualize',
          },
        },
      ],
      href: paths.dashboard.ConsultNew,
    },
    { key: 'Clients', title: role === 1 ? 'Parceiros' : 'Afiliados', href: paths.dashboard.customers, icon: 'users' },
    {
      key: 'Config',
      title: 'Configurações',
      href: paths.dashboard.settings,
      icon: 'gear-six',
      children: [
        {
          label: 'Criar Lista',
          title: 'Agrupamento de listas',
          icon: 'listPlus',
          href: paths.dashboard.settings,
        },
        {
          title: 'Criação de Serviços',
          icon: 'listBullets',
          href: paths.dashboard.settingsServices,
        },
      ],
    },
    { key: 'Conta', title: 'Conta', href: paths.dashboard.account, icon: 'user' },
    {
      key: 'services',
      title: 'Serviços',
      icon: 'forms',
      children: [
        {
          title: 'Serviços disponiveis',
          icon: 'listPlus',
          href: paths.dashboard.services,
        },
        {
          title: 'Serviços cadastrados',
          icon: 'listBullets',
          href: paths.dashboard.servicesList,
        },
      ],
    },
    { key: 'Relatórios', title: 'Relatórios', href: paths.dashboard.relatorio, icon: 'relatorio' },
  ];

  if (role === 1) {
    return allNavItems;
  }

  if (role === 3) {
    return allNavItems.filter(
      (item) => item.key === 'Consultar' || item.key === 'Conta' || item.key === 'services' || item.key === 'Home'
    );
  }

  if (role === 2) {
    return allNavItems.filter(
      (item) =>
        item.key === 'Consultar' ||
        item.key === 'Conta' ||
        // item.key === 'Clients' ||
        // item.key === 'services' ||
        item.key === 'Home'
    );
  }

  return [];
};

/**
  {
    key: 'Processos',
    title: 'Processos',
    icon: 'law',
    href: paths.dashboard.Consult,
    children: [
      {
        label: 'Novo Processo',
        title: 'Novo Processo',
        icon: 'listPlus',
        href: paths.dashboard.ProcessNew,
      },
      {
        title: 'Lista de Processos',
        icon: 'listBullets',
        href: paths.dashboard.Process,
      },
    ],
  },
  {
    key: 'Prazos',
    title: 'Prazos / Publicações',
    icon: 'clock',
    href: paths.dashboard.Consult,
    children: [
      {
        label: 'Gerenciamento de Prazos',
        title: 'Gerenciamento de Prazos',
        icon: 'listBullets',
        href: paths.dashboard.prazos,
      },
      {
        title: 'Calendario de Prazos',
        icon: 'calendar',
        href: paths.dashboard.prazosCalendar,
      },
    ],
  }, */
