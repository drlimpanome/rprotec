'use client';

import * as React from 'react';
import dayjs from '@/utils/dayjs-config';
import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import * as icon from '@phosphor-icons/react';

type Props = {
  expiresAt?: string | null; // ISO
};

export default function NextListStatCard({ expiresAt }: Props) {
  const label = expiresAt ? dayjs(expiresAt).format('DD/MM/YYYY HH:mm') : '—';

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        bgcolor: (t) => t.palette.primary.main,
        color: (t) => t.palette.primary.contrastText,
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.25)',
              color: 'inherit',
              width: 48,
              height: 48,
              boxShadow: 0,
            }}
          >
            <icon.ClockCountdown size={24} weight="fill" />
          </Avatar>

          <Stack>
            <Typography variant="overline" sx={{ opacity: 0.9 }}>
              Próxima lista
            </Typography>
            <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
              {label}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
