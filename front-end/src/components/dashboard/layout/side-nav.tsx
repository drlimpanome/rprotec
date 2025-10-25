'use client';

import * as React from 'react';
import Image from 'next/image';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { CaretDown, CaretUp, PushPin, PushPinSlash, User as UserIcon } from '@phosphor-icons/react';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUser } from '@/hooks/use-user';
import { usePopover } from '@/hooks/use-popover';

import { getNavItems, navIcons } from './config';
import { UserPopover } from './user-popover';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();
  const userPopover = usePopover<HTMLDivElement>();
  
  // Sistema Pin/Unpin com hover
  const [isPinned, setIsPinned] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('sidebar-pinned');
    if (saved !== null) {
      setIsPinned(saved === 'true');
    }
  }, []);

  React.useEffect(() => {
    const width = isExpanded ? '280px' : '90px';
    const event = new CustomEvent('sidebar-width-change', { detail: { width } });
    window.dispatchEvent(event);
  }, [isPinned, isHovered]);

  const handlePinToggle = () => {
    const newState = !isPinned;
    setIsPinned(newState);
    localStorage.setItem('sidebar-pinned', String(newState));
  };

  const isExpanded = isPinned || isHovered;

  return (
    <>
      {/* Sidebar - Desktop Only (Mobile usa bottom nav) */}
      <Box
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
        sx={{
          '--SideNav-color': 'var(--mui-palette-common-white)',
          '--NavItem-color': 'rgba(255, 255, 255, 0.7)',
          '--NavItem-hover-background': 'rgba(0, 183, 197, 0.15)',
          '--NavItem-active-background': 'rgba(0, 225, 194, 0.2)',
          '--NavItem-active-color': 'var(--mui-palette-common-white)',
          '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
          '--NavItem-icon-color': 'rgba(255, 255, 255, 0.6)',
          '--NavItem-icon-active-color': '#00e1c2',
          '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
          background: 'linear-gradient(180deg, #1a0b44 0%, #003677 100%)',
          color: 'var(--SideNav-color)',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          height: '100%',
          left: 0,
          maxWidth: '100%',
          position: 'fixed',
          scrollbarWidth: 'none',
          top: 0,
          width: { lg: isExpanded ? '280px' : '90px' },
          zIndex: isPinned ? 'var(--SideNav-zIndex)' : 1200,
          '&::-webkit-scrollbar': { display: 'none' },
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.3)',
          transition: 'width 0.3s ease',
        }}
      >
      <Stack spacing={2} sx={{ p: 2, pt: 2 }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
        >
          <Box 
            component={RouterLink} 
            href={paths.home} 
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: isExpanded ? 2 : 0.5,
              borderRadius: '12px',
              background: 'rgba(0, 225, 194, 0.1)',
              border: '1px solid rgba(0, 225, 194, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(0, 225, 194, 0.2)',
                boxShadow: '0 0 20px rgba(0, 225, 194, 0.3)',
                transform: 'scale(1.05)',
              }
            }}
          >
            <Image 
              src={isExpanded ? "/assets/logo.png" : "/assets/img/android-chrome-192x192.png"}
              alt="Logo" 
              width={isExpanded ? 180 : 40} 
              height={isExpanded ? 50 : 40}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
          {isExpanded && (
            <IconButton 
              onClick={handlePinToggle}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  background: 'rgba(0, 225, 194, 0.1)',
                }
              }}
            >
              {isPinned ? <PushPin size={20} weight="fill" /> : <PushPinSlash size={20} />}
            </IconButton>
          )}
        </Stack>
      </Stack>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: getNavItems(user?.role || 2), collapsed: !isExpanded })}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mt: 'auto' }} />
      <Stack 
        direction="row" 
        spacing={isExpanded ? 1.5 : 0}
        alignItems="center" 
        justifyContent={isExpanded ? 'flex-start' : 'center'}
        sx={{ 
          p: isExpanded ? 2 : 1, 
          pb: isExpanded ? 2.5 : 1.5,
          cursor: 'pointer',
          borderRadius: '10px',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(0, 225, 194, 0.1)',
          }
        }}
        onClick={userPopover.handleOpen}
        ref={userPopover.anchorRef}
      >
        <Avatar
          sx={{ 
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #008bbb 0%, #00b7c5 100%)',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
          }}
        >
          <UserIcon size={24} weight="fill" />
        </Avatar>
        {isExpanded && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="div"
              sx={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: 'rgba(255, 255, 255, 0.9)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.username || 'Usuário'}
            </Typography>
          </Box>
        )}
      </Stack>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
    </Box>
    </>
  );
}

function renderNavItems({ items = [], pathname, collapsed }: { items?: NavItemConfig[]; pathname: string; collapsed: boolean }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} collapsed={collapsed} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
  collapsed: boolean;
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
  collapsed,
}: NavItemProps): React.JSX.Element {
  const { user } = useUser();
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    if (children) {
      setOpen((prevOpen) => !prevOpen);
    }
  };

  const isNavigable = !children && href;

  return (
    <>
      <li>
        <Box
          component={isNavigable ? (external ? 'a' : RouterLink) : 'div'}
          href={isNavigable ? href : undefined}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          onClick={handleClick}
          sx={{
            alignItems: 'center',
            borderRadius: '10px',
            color: 'var(--NavItem-color)',
            cursor: 'pointer',
            display: 'flex',
            flex: '0 0 auto',
            gap: 1.5,
            px: 2,
            py: 1.5,
            position: 'relative',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: active ? 'var(--NavItem-active-background)' : 'transparent',
            backdropFilter: active ? 'blur(8px)' : 'none',
            border: active ? '1px solid rgba(0, 225, 194, 0.4)' : 'transparent',
            ...(disabled && {
              bgcolor: 'var(--NavItem-disabled-background)',
              color: 'var(--NavItem-disabled-color)',
              cursor: 'not-allowed',
            }),
            ...(!disabled && {
              '&:hover': {
                background: 'var(--NavItem-hover-background)',
                backdropFilter: 'blur(8px)',
                color: 'var(--NavItem-active-color)',
                transform: 'translateX(4px)',
              },
            }),
          }}
        >
          <Box 
            sx={{ 
              alignItems: 'center', 
              display: 'flex', 
              justifyContent: 'center', 
              flex: '0 0 auto',
              p: 0.5,
              borderRadius: '8px',
              background: active ? 'rgba(0, 225, 194, 0.15)' : 'transparent',
              transition: 'all 0.3s ease',
            }}
          >
            {Icon ? (
              <Icon
                fill={active && isNavigable ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
                fontSize="var(--icon-fontSize-md)"
                weight={active && isNavigable ? 'fill' : undefined}
                style={{
                  filter: active ? 'drop-shadow(0 0 8px rgba(0, 225, 194, 0.5))' : 'none',
                }}
              />
            ) : null}
          </Box>
          {!collapsed && (
            <Box sx={{ flex: '1 1 auto' }}>
              <Typography
                component="span"
                sx={{ 
                  color: 'inherit', 
                  fontSize: '0.875rem', 
                  fontWeight: active ? 600 : 500, 
                  lineHeight: '28px',
                  letterSpacing: '0.3px',
                }}
              >
                {title}
              </Typography>
            </Box>
          )}
          {!collapsed && children && (open ? <CaretUp /> : <CaretDown />)}
        </Box>
        {!collapsed && children && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', m: 0, p: 0, pl: 4, mt: 0.5 }}>
              {children.map((child, index) => (
                <NavItem key={`sub-nav-${index}`} {...child} pathname={pathname} collapsed={collapsed} />
              ))}
            </Stack>
          </Collapse>
        )}
      </li>
    </>
  );
}
