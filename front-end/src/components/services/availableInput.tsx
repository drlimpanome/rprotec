import React, { useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';

import DynamicInput, { InputField } from './DynamicInput';

interface AvailableInputsProps {
  onAddField: (field: InputField) => void;
}

const AvailableInputs: React.FC<AvailableInputsProps> = ({ onAddField }) => {
  const [selectedField, setSelectedField] = useState<InputField | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  const inputFields: InputField[] = [
    { id: 1, label: 'Texto', type: 'text' },
    { id: 2, label: 'Telefone', type: 'tel' },
    { id: 3, label: 'Documento (CPF / CNPJ)', type: 'cpfcnpj' },
    { id: 4, label: 'Anexo de Documento', type: 'file' },
    { id: 5, label: 'Data', type: 'date' },
  ];

  const handleFieldSelection = (field: InputField) => {
    setSelectedField(field);
    setCustomLabel(field.label); // Definir o rótulo padrão do campo selecionado
    setIsRequired(false); // Resetar o estado de obrigatório
  };

  const handleAddField = () => {
    if (selectedField && customLabel.trim()) {
      onAddField({ ...selectedField, label: customLabel.trim(), required: isRequired });
      setSelectedField(null);
      setCustomLabel('');
      setIsRequired(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Configurar Campo
      </Typography>
      <Stack spacing={2}>
        {/* Botões para selecionar o tipo de campo */}
        {inputFields.map((field) => (
          <Button
            key={field.id}
            variant={selectedField?.id === field.id ? 'contained' : 'outlined'}
            onClick={() => handleFieldSelection(field)}
          >
            {field.label}
          </Button>
        ))}

        {/* Input para alterar o nome do campo */}
        {selectedField && (
          <>
            <TextField
              label="Nome do Campo"
              variant="outlined"
              fullWidth
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
            />

            {/* Checkbox para marcar como obrigatório */}
            <FormControlLabel
              control={<Checkbox checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />}
              label="Campo Obrigatório"
            />
          </>
        )}

        {/* Botão para adicionar o campo configurado à lista */}
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedField || !customLabel.trim()}
          onClick={handleAddField}
        >
          Adicionar
        </Button>
      </Stack>
    </Box>
  );
};

export default AvailableInputs;
