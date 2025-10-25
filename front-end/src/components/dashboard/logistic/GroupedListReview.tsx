'use client';

import React from 'react';
import dayjs from '@/utils/dayjs-config';
import { Box, Card, CardContent, Divider, Grid, Typography } from '@mui/material';
import { CalendarBlank, ClipboardText, CurrencyDollar, Users } from '@phosphor-icons/react';

import { ListGroupData } from '@/types/list';

interface GroupedListReviewProps {
  groupData: ListGroupData;
}

const GroupedListReview: React.FC<GroupedListReviewProps> = ({ groupData }) => {
  const renderListSummaryCards = () => {
    return groupData.lists.map((list, index) => {
      const totalNames = list.listData.length;
      const costPerName = list.client?.price_consult || 0;
      const totalValue = totalNames * costPerName;
      const creationDate = dayjs(list.creation_date).format('MMM D, YYYY');

      return (
        <Card
          key={list.id}
          sx={{
            my: 3,
            p: 2,
            borderRadius: 3,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            transition: '0.3s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ClipboardText size={28} style={{ marginRight: '10px' }} />
              {list.client?.username} / {list.client?.email}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <Users size={24} style={{ marginRight: '8px' }} />
                  <Typography variant="body1">Total de Nomes:</Typography>
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                    {totalNames}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CurrencyDollar size={24} style={{ marginRight: '8px' }} />
                  <Typography variant="body1">Custo por Nome:</Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      ml: 1,
                      fontWeight: 600,
                      color: 'primary.main',
                    }}
                  >
                    R$ {costPerName.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CurrencyDollar size={24} style={{ marginRight: '8px' }} />
                  <Typography variant="body1">Valor Total:</Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      ml: 1,
                      fontWeight: 600,
                      color: 'primary.main',
                    }}
                  >
                    R$ {totalValue.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CalendarBlank size={24} style={{ marginRight: '8px' }} />
                  <Typography variant="body1">Data de Criação:</Typography>
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                    {creationDate}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Listas nesse Agrupamento
      </Typography>
      {renderListSummaryCards()}
    </Box>
  );
};

export default GroupedListReview;
