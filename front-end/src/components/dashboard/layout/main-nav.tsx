'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { User as UserIcon } from '@phosphor-icons/react';

import { usePopover } from '@/hooks/use-popover';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  const userPopover = usePopover<HTMLDivElement>();

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(90deg, rgba(26, 11, 68, 0.05) 0%, rgba(0, 54, 119, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 183, 197, 0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            minHeight: '64px', 
            px: 3,
          }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ 
                display: { lg: 'none' },
                color: 'var(--color-primary)',
                '&:hover': {
                  background: 'rgba(0, 183, 197, 0.1)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <ListIcon />
            </IconButton>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              sx={{ 
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #008bbb 0%, #00b7c5 100%)',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 0 20px rgba(0, 225, 194, 0.5)',
                }
              }}
            >
              <UserIcon size={24} weight="fill" />
            </Avatar>
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
