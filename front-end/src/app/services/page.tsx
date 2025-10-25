'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Divider, Grid, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import AvailableInputs from '@/components/services/availableInput';
import GeneratedForm from '@/components/services/GeneratedForm';

export interface InputField {
  id: number;
  label: string;
  type: string;
  fieldName?: string;
  required?: boolean;
}

const ServiceBuilder = ({
  handleSaveService,
  serviceId,
  defaultEditForm,
}: {
  handleSaveService: (name: string, service: any, id: number) => void;
  serviceId: number;
  defaultEditForm?: { id: number; name: string; formFields: InputField[]; active: boolean };
}) => {
  const [formFields, setFormFields] = useState<InputField[]>([]);
  const [formName, setFormName] = useState<string>('');

  // Se houver um formulário para edição, preencher os campos com as informações do formulário
  useEffect(() => {
    if (defaultEditForm) {
      setFormName(defaultEditForm.name + ' - copia'); // Definir o nome do formulário
      setFormFields(defaultEditForm.formFields); // Preencher os campos do formulário
    }
  }, [defaultEditForm]);

  // Função para adicionar campos ao formulário
  const addFieldToForm = (field: Omit<InputField, 'id'>) => {
    setFormFields((prev) => [
      ...prev,
      {
        ...field,
        id: prev.length, // ID baseado no índice do array
      },
    ]);
  };

  // Função para lidar com o envio do formulário (criação ou edição)
  const handleFormSubmit = () => {
    handleSaveService(formName, formFields, serviceId);
  };

  // Função para limpar o formulário e redefinir o estado
  const handleResetParentState = () => {
    setFormFields([]);
    setFormName('');
    toast.success('Formulário limpo e reiniciado!');
  };

  return (
    <Grid container spacing={2} mt={2} ml={1}>
      {/* Nome do Formulário */}
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom mb={2}>
          {defaultEditForm ? 'Clonagem de Formulário' : 'Criação de Formulário'}
        </Typography>
        <TextField
          fullWidth
          label="Nome do Formulário"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
      </Grid>

      {/* Lista de Inputs Disponíveis */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" mb={2}>
              Lista de Inputs Disponíveis
            </Typography>
            <Divider style={{ margin: '16px 0' }} />
            <AvailableInputs onAddField={addFieldToForm} />
          </CardContent>
        </Card>
      </Grid>

      {/* Formulário Gerado */}
      <Grid item xs={12} md={8}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" mb={2}>
              Formulário Gerado
            </Typography>
            <Divider style={{ margin: '16px 0' }} />
            <GeneratedForm
              formFields={formFields}
              handleFormSubmit={handleFormSubmit}
              formSubmitButtonName={defaultEditForm ? 'Criar novo Formulário' : 'Salvar Formulário'}
              canRemove
              handleResetParentState={handleResetParentState}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ServiceBuilder;
