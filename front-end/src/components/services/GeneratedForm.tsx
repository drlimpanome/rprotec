import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Warning } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

import DynamicInput, { InputField } from './DynamicInput';

interface GeneratedFormProps {
  formFields: InputField[];
  renderOnly?: boolean;
  handleFormSubmit?: (data: any) => Promise<void>;
  formSubmitButtonName?: string;
  canRemove?: boolean;
  handleResetParentState?: () => void;
  handleReject?: (data: any) => Promise<void>;
  canReject?: boolean;
  HandleApprove?: () => Promise<void>;
  userRole?: number;
}

const GeneratedForm: React.FC<GeneratedFormProps> = ({
  formFields,
  renderOnly = false,
  handleFormSubmit,
  formSubmitButtonName = 'Submeter Formulário',
  canRemove = false,
  handleResetParentState,
  handleReject,
  canReject = false,
  HandleApprove,
  userRole,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [rejectedFields, setRejectedFields] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const initialData = formFields.reduce(
      (acc, field) => {
        acc[field.id] = field.answer ?? (field.type === 'file' ? null : '');
        return acc;
      },
      {} as Record<string, any>
    );
    setFormData(initialData);
  }, [formFields]);

  const handleInputChange = (value: { id: string; file?: File | null; value?: any }) => {
    const { id, file, value: inputValue } = value;
    setFormData((prev) => ({
      ...prev,
      [id]: file ?? inputValue,
    }));
  };

  const handleSubmit = async () => {
    if (handleFormSubmit) {
      setIsSubmitting(true);
      try {
        await handleFormSubmit(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    const resetData = formFields.reduce(
      (acc, field) => {
        acc[field.id] = field.answer ?? (field.type === 'file' ? null : '');
        return acc;
      },
      {} as Record<string, any>
    );
    setFormData(resetData);
    setRejectedFields({});
    if (handleResetParentState) {
      handleResetParentState();
    }
  };

  const handleSaveRejections = async () => {
    if (handleReject) {
      setIsSubmitting(true);
      try {
        const filteredRejections = Object.fromEntries(
          Object.entries(rejectedFields).filter(([_, reason]) => reason.trim() !== '')
        );

        if (Object.keys(filteredRejections).length === 0) {
          toast.error('Por favor, insira pelo menos um motivo de rejeição.');
          return;
        }

        await handleReject(filteredRejections);
        setDialogOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box>
      {formFields.map((field) => {
        const isInvalid = !!field.invalid_reason;
        return (
          <Stack
            key={field.id + '-container'}
            direction="column"
            spacing={1}
            sx={{
              padding: isInvalid ? 2 : 0,
              border: isInvalid ? '1px solid #ffcdc9' : 'none',
              borderRadius: 2,
            }}
          >
            <Stack key={field.id} direction="row" alignItems="center" sx={{ width: '100%' }}>
              <DynamicInput
                field={field}
                value={formData[field.id]}
                onChange={!renderOnly ? handleInputChange : undefined}
                renderOnly={renderOnly}
              />
            </Stack>

            {isInvalid && (
              <Alert severity="error" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                  Campo inválido: {field.invalid_reason}
                </Typography>
              </Alert>
            )}
          </Stack>
        );
      })}

      <Stack spacing={2} mt={2} direction="row">
        {HandleApprove === undefined && !renderOnly && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !Object.keys(formData).length}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isSubmitting ? 'Salvando...' : formSubmitButtonName}
          </Button>
        )}

        {HandleApprove !== undefined && (
          <Button
            onClick={async () => {
              setIsApproving(true);
              try {
                await HandleApprove();
                setIsApproving(false);
              } catch (error) {
                setIsApproving(false);
              }
            }}
            color="primary"
            variant="outlined"
            disabled={isApproving}
          >
            {isApproving ? <CircularProgress size={20} color="inherit" /> : 'Aprovar Formulário'}
          </Button>
        )}

        {canRemove && (
          <Button variant="outlined" color="error" onClick={handleReset} disabled={isSubmitting}>
            Limpar Formulário
          </Button>
        )}

        {canReject && (
          <Button variant="outlined" color="warning" onClick={() => setDialogOpen(true)}>
            Rejeitar campos do formulário
          </Button>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Justifique a rejeição dos campos</DialogTitle>
        <DialogContent>
          {formFields.map((field) => (
            <Box key={field.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{field.label}</Typography>
              <TextField
                fullWidth
                placeholder="Explique o motivo da invalidação desse campo"
                value={rejectedFields[field.id] || ''}
                onChange={(e) => setRejectedFields((prev) => ({ ...prev, [field.id]: e.target.value }))}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSaveRejections} color="primary" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeneratedForm;
