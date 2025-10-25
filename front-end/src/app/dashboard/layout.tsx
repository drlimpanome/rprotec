'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';

import { AuthGuard } from '@/components/auth/auth-guard';
import { SideNav } from '@/components/dashboard/layout/side-nav';
import { MobileBottomNav } from '@/components/dashboard/layout/mobile-bottom-nav';
import '@/styles/corporate-theme.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const [sidebarWidth, setSidebarWidth] = React.useState('280px');

  React.useEffect(() => {
    const handleSidebarChange = (event: CustomEvent) => {
      setSidebarWidth(event.detail.width);
    };

    window.addEventListener('sidebar-width-change' as any, handleSidebarChange);
    return () => {
      window.removeEventListener('sidebar-width-change' as any, handleSidebarChange);
    };
  }, []);

  return (
    <AuthGuard>
      <GlobalStyles
        styles={{
          body: {
            '--SideNav-width': '280px',
            '--SideNav-width-dynamic': sidebarWidth,
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        <SideNav />
        <Box 
          sx={{ 
            display: 'flex', 
            flex: '1 1 auto', 
            flexDirection: 'column', 
            pl: { 
              xs: 0, 
              lg: 'var(--SideNav-width-dynamic)' 
            },
            pb: { xs: '70px', lg: 0 },
            transition: 'padding-left 0.3s ease',
          }}
        >
          <Box
            component="main"
            sx={{
              minHeight: '100vh',
              backgroundColor: '#F8F9FA',
              p: 3,
            }}
          >
            <Container maxWidth="xl">
              {children}
            </Container>
          </Box>
        </Box>
        <MobileBottomNav />
      </Box>
    </AuthGuard>
  );
}
