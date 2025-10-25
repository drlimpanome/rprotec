import React, { useState } from 'react';
import { Box, Button, Card, Grid, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';

interface DynamicListInputProps {
  onChange: (data: { nome: string; cpf: string }[]) => void;
}

const DynamicListInput: React.FC<DynamicListInputProps> = ({ onChange }) => {
  const [inputs, setInputs] = useState([{ nome: '', cpf: '' }]);

  const handleAddInput = () => {
    setInputs([...inputs, { nome: '', cpf: '' }]);
  };

  const handleInputChange = (index: number, field: 'nome' | 'cpf', value: string) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
    onChange(newInputs);
  };

  return (
    <Card sx={{ p: 3, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Lista de Nome e CPF
      </Typography>
      {inputs.map((input, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome"
                variant="outlined"
                fullWidth
                value={input.nome}
                onChange={(e) => handleInputChange(index, 'nome', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CPF"
                variant="outlined"
                fullWidth
                value={input.cpf}
                onChange={(e) => handleInputChange(index, 'cpf', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" onClick={handleAddInput}>
          Adicionar
        </Button>
      </Box>
    </Card>
  );
};

export default DynamicListInput;
