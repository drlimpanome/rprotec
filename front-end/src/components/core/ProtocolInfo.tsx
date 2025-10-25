// ProtocolInfo.tsx
import React from 'react';
import dayjs from '@/utils/dayjs-config';
import { Box, Card, Grid, Typography } from '@mui/material';
import { CalendarBlank, IdentificationBadge } from '@phosphor-icons/react/dist/ssr';

import { ListStatus } from '@/types/list';

import { statusColors } from '../dashboard/logistic/logistic-table';

interface ProtocolInfoProps {
  protocol: string;
  creationDate: Date;
  status: ListStatus;
}

const ProtocolInfo: React.FC<ProtocolInfoProps> = ({ protocol, creationDate, status }) => {
  return (
    <Card sx={{ 
      p: 2, 
      mb: 2, 
      borderRadius: 2,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 183, 197, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    }}>
      <Grid container spacing={1.5} alignItems="center">
        {/* Protocol Section */}
        <Grid item xs={12} md={12}>
          <Box display="flex" alignItems="center">
            <IdentificationBadge size={28} color="#003677" style={{ marginRight: '12px' }} />
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8125rem' }}>
                Número do Protocolo
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#003677' }}>
                {protocol}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Creation Date Section */}
        <Grid item xs={6} md={8}>
          <Box display="flex" alignItems="center">
            <CalendarBlank size={28} color="#00B7C5" style={{ marginRight: '12px' }} />
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8125rem' }}>
                Data de Criação
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {dayjs(creationDate).format('DD/MM/YYYY')}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Status Section */}
        <Grid item xs={12} md={4}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              backgroundColor: statusColors[status?.toLocaleLowerCase()],
              color: '#FFF',
              borderRadius: 1,
              p: 1.5,
              textAlign: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {status === 'pagamento aprovado afiliado' ? 'Lista paga pelo Afiliado' : status}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ProtocolInfo;
