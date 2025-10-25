'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { CaretDown, ClipboardText, CurrencyDollar, ListBullets, UserCircle, UserList } from '@phosphor-icons/react';

export type ResponsibleReport = {
  responsible: string;
  lists: {
    list_name: string;
    names_quantity: number;
    total_price: number;
    client: string;
  }[];
};

interface ResponsibleReportViewerProps {
  reportList: ResponsibleReport[];
}

export const ResponsibleReportViewer: React.FC<ResponsibleReportViewerProps> = ({ reportList }) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (responsible: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? responsible : false);
  };

  return (
    <Stack spacing={3}>
      {reportList.map(({ responsible, lists }) => {
        const totalLists = lists?.length ?? 0;
        const totalNames = lists?.reduce((sum, list) => sum + list.names_quantity, 0);
        const totalPrice = lists?.reduce((sum, list) => sum + list.total_price, 0);

        return (
          <Accordion
            key={responsible}
            expanded={expanded === responsible}
            onChange={handleChange(responsible)}
            sx={{
              border: '1px solid #ccc',
              borderRadius: 2,
              mb: 2,
              px: 2,
              backgroundColor: '#fff',
            }}
          >
            <AccordionSummary
              expandIcon={<CaretDown size={20} weight="bold" />}
              sx={{
                minHeight: 100,
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <UserCircle size={28} />
                <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
                  Responsável {responsible}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" sx={{ flex: 1 }}>
                <Chip
                  icon={<ListBullets size={18} />}
                  label={`Listas: ${totalLists}`}
                  color="primary"
                  size="medium"
                  sx={{ height: 48, minWidth: 150, fontWeight: 500 }}
                />
                <Chip
                  icon={<UserList size={18} />}
                  label={`Nomes: ${totalNames}`}
                  color="secondary"
                  size="medium"
                  sx={{ height: 48, minWidth: 150, fontWeight: 500 }}
                />
                <Chip
                  icon={<CurrencyDollar size={18} />}
                  label={`R$ ${totalPrice.toFixed(2)}`}
                  color="success"
                  size="medium"
                  sx={{ height: 48, minWidth: 150, fontWeight: 500, marginRight: 2 }}
                />
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ backgroundColor: '#fafafa' }}>
              <Stack spacing={2}>
                {lists.map((list, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ClipboardText size={18} />
                          <Typography variant="subtitle1" fontWeight={600}>
                            {list.list_name}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                          <Chip
                            icon={<UserCircle size={14} />}
                            label={`Cliente: ${list.client}`}
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            icon={<UserList size={14} />}
                            label={`Nomes: ${list.names_quantity}`}
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            icon={<CurrencyDollar size={14} />}
                            label={`Valor: R$ ${list.total_price.toFixed(2)}`}
                            variant="outlined"
                            size="small"
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
};
