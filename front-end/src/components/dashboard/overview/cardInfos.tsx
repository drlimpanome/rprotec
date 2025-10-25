import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';

export interface BudgetProps {
  trend: 'up' | 'down';
  sx?: SxProps;
  value: number | string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export function CardInfos({ trend, sx, value, subtitle, title, icon }: BudgetProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? '#00e1c2' : '#008bbb';

  return (
    <Card 
      className="animate-fade-in"
      sx={{
        ...sx,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 183, 197, 0.2)',
        borderRadius: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(0, 225, 194, 0.4)',
          boxShadow: '0 8px 24px rgba(0, 225, 194, 0.15)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              variant="overline" 
              sx={{ 
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${trendColor}20 0%, ${trendColor}10 100%)`,
                color: trendColor,
              }}
            >
              <TrendIcon fontSize="1rem" />
            </Box>
          </Stack>
          <Typography 
            variant="h5" 
            sx={{ 
              color: trendColor,
              fontWeight: 700,
              fontSize: '1.75rem',
              lineHeight: 1.2,
              textShadow: `0 0 20px ${trendColor}40`,
            }}
          >
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
