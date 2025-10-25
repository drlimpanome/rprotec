import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';

export interface BudgetProps {
  trend: 'up' | 'down';
  sx?: SxProps;
  value: {
    totalClients: number;
    nextMontRevenue: number;
    nextMontIncrease: number;
  };
  icon: React.ReactNode;
}

export function MultipleCard({ trend, sx, value }: BudgetProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent sx={{ height: '100%' }}>
        <Stack
          direction="column"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-evenly', height: '100%', fontWeight: 'bold' }}
          spacing={3}
        >
          <Stack spacing={1} sx={{ ml: 4 }}>
            <Typography color="text.secondary" variant="overline">
              Total Clientes
            </Typography>
            <Typography variant="h2" sx={{ color: trendColor }}>
              {value.totalClients}
            </Typography>
          </Stack>
          <Stack spacing={1} sx={{ ml: 4 }}>
            <Typography color="text.secondary" variant="overline">
              Projeção próximo mês
            </Typography>
            <Typography variant="h2" sx={{ color: trendColor }}>
              {value.nextMontRevenue}
            </Typography>
          </Stack>
          <Stack spacing={1} sx={{ ml: 4 }}>
            <Typography color="text.secondary" variant="overline">
              Aumento de nomes
            </Typography>
            <Typography variant="h2" sx={{ color: trendColor }}>
              {value.nextMontIncrease}%
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
