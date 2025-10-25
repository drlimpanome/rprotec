import React from 'react';
import { Button, Card, CardContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import { NumericFormat } from 'react-number-format';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { Copy } from '@phosphor-icons/react';

interface AffiliateFeeCardProps {
  link: string;
  service: string;
  cost: number;
  onCostChange: (newCost: number) => void;
  onSave: () => void;
}

export const AffiliateFeeCard: React.FC<AffiliateFeeCardProps> = ({ link, service, cost, onCostChange, onSave }) => {
  const handleCopyClick = () => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleCostChange = (values: { value: string }) => {
    onCostChange(parseFloat(values.value || '0'));
  };

  return (
    <Card sx={{ margin: 2 }} variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {/* Campo de Link */}
            <Grid item xs={12} md={12}>
              <TextField
                label="Link de Referência"
                value={link}
                fullWidth
                disabled
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopyClick} edge="end">
                        <Copy />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Campo de Preço 
            <Grid item xs={12} md={4}>
              <NumericFormat
                value={cost}
                onValueChange={handleCostChange}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                label="Preço da Liminar"
                decimalScale={2}
                fixedDecimalScale
                customInput={TextField}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="contained" onClick={onSave} fullWidth>
                Salvar
              </Button>
              </Grid> */}
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};
