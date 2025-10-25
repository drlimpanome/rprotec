'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { CaretRight, House } from '@phosphor-icons/react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function AppBreadcrumbs({ items }: AppBreadcrumbsProps): React.JSX.Element {
  const router = useRouter();

  return (
    <Breadcrumbs 
      separator={<CaretRight size={14} weight="bold" />}
      sx={{ mb: 2 }}
    >
      <Link
        underline="hover"
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        color="inherit"
        onClick={() => router.push('/home')}
      >
        <House size={16} style={{ marginRight: 4 }} />
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (isLast) {
          return (
            <Typography key={index} color="text.primary" sx={{ fontWeight: 600 }}>
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={index}
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => item.href && router.push(item.href)}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

