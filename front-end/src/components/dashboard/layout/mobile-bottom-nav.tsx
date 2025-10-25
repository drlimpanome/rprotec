'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';

import { useUser } from '@/hooks/use-user';
import { usePopover } from '@/hooks/use-popover';
import { getNavItems, navIcons } from './config';
import { UserPopover } from './user-popover';

export function MobileBottomNav(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const userPopover = usePopover<HTMLDivElement>();
  
  // Expandir itens com submenu para mostrar todos os subitens separadamente
  const allNavItems = getNavItems(user?.role || 2);
  const navItems = allNavItems
    .filter(item => item.key !== 'Conta') // Remove item Conta (substituído por botão Perfil)
    .flatMap(item => {
      // Se tem children, retorna os children ao invés do item pai
      if (item.children && item.children.length > 0) {
        return item.children.map((child: any) => ({
          key: child.title,
          title: child.title,
          href: child.href,
          icon: child.icon,
        }));
      }
      // Senão, retorna o item normal
      return [item];
    });
  
  // Adicionar botão de perfil no final
  navItems.push({
    key: 'profile',
    title: 'Perfil',
    href: '',
    icon: 'user',
  });
  
  // Encontrar indice do item ativo
  const activeIndex = navItems.findIndex(item => item.href && pathname === item.href);

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        display: { xs: 'block', lg: 'none' },
        zIndex: 1100,
        borderTop: '1px solid rgba(0, 225, 194, 0.2)',
        borderRadius: 0,
        background: '#1a0b44',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={activeIndex}
        onChange={(event, newValue) => {
          const selectedItem = navItems[newValue];
          if (selectedItem?.key === 'profile') {
            // Abrir popover de perfil
            userPopover.handleOpen();
          } else if (selectedItem?.href) {
            router.push(selectedItem.href);
          }
        }}
        sx={{
          background: 'transparent',
          height: 70,
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(255, 255, 255, 0.6)',
            minWidth: 'auto',
            padding: '8px 12px',
            '&.Mui-selected': {
              color: '#00e1c2',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 600,
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.65rem',
              marginTop: '4px',
            }
          }
        }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon ? navIcons[item.icon] : null;
          const isProfile = item.key === 'profile';
          
          return (
            <BottomNavigationAction
              key={item.key}
              label={item.title}
              icon={Icon ? <Icon size={24} /> : null}
              ref={isProfile ? userPopover.anchorRef : undefined}
            />
          );
        })}
      </BottomNavigation>
      {userPopover.anchorRef.current && (
        <UserPopover 
          anchorEl={userPopover.anchorRef.current} 
          onClose={userPopover.handleClose} 
          open={userPopover.open} 
        />
      )}
    </Paper>
  );
}

