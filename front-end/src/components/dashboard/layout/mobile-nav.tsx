'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUser } from '@/hooks/use-user';

import { getNavItems, navIcons } from './config';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Drawer
      PaperProps={{
        sx: {
          '--MobileNav-background': 'var(--mui-palette-neutral-950)',
          '--MobileNav-color': 'var(--mui-palette-common-white)',
          '--NavItem-color': 'var(--mui-palette-neutral-300)',
          '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
          '--NavItem-active-background': 'var(--mui-palette-primary-main)',
          '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
          '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
          '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
          bgcolor: 'var(--MobileNav-background)',
          color: 'var(--MobileNav-color)',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          scrollbarWidth: 'none',
          width: 'var(--MobileNav-width)',
          zIndex: 'var(--MobileNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}></Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: getNavItems(user?.role || 2), onClose })}
      </Box>
    </Drawer>
  );
}

function renderNavItems({
  items = [],
  pathname,
  onClose,
}: {
  items?: NavItemConfig[];
  pathname: string;
  onClose?: () => void;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} {...item} onClose={onClose} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'children'> {
  pathname: string;
  children?: NavItemConfig[]; // Handle sub-navigation items
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  children,
  onClose,
}: NavItemProps): React.JSX.Element {
  const { user } = useUser();
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;
  const [open, setOpen] = React.useState(false);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Evita cliques duplicados

    if (children) {
      // Se houver submenus, apenas expande/recolhe, sem fechar o menu principal
      setOpen((prevOpen) => !prevOpen);
    } else {
      // Se for um link normal, fecha o menu após a navegação
      if (onClose) {
        setTimeout(() => onClose(), 150); // Pequeno delay para garantir a navegação antes de fechar
      }
    }
  };

  const isNavigable = !children && href;

  return (
    <li>
      <Box
        component={isNavigable ? (external ? 'a' : RouterLink) : 'div'}
        href={isNavigable ? href : undefined}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        onClick={handleClick}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active &&
            isNavigable && {
              bgcolor: 'var(--NavItem-active-background)',
              color: 'var(--NavItem-active-color)',
            }),
        }}
      >
        {Icon && (
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
            <Icon
              fill={active && isNavigable ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active && isNavigable ? 'fill' : undefined}
            />
          </Box>
        )}
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
        {children && (open ? <CaretUp /> : <CaretDown />)}
      </Box>
      {children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0, pl: 4 }}>
            {children.map((child, index) => (
              <NavItem key={`sub-nav-${index}`} {...child} pathname={pathname} onClose={onClose} />
            ))}
          </Stack>
        </Collapse>
      )}
    </li>
  );
}
