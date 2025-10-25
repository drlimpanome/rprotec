import React from 'react';
import { Grid, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface TextInputProps {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date';
  size: number;
  required: boolean;
  control: Control<any>;
  errors: FieldErrors;
  defaultValue?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  name,
  label,
  type,
  size,
  required,
  control,
  errors,
  defaultValue = '',
}) => {
  return (
    <Grid item xs={12} md={size}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{ required }}
        render={({ field }) => (
          <TextField
            InputLabelProps={{ shrink: true }}
            {...field}
            label={label}
            type={type}
            fullWidth
            error={!!errors[name]}
            helperText={errors[name] ? 'Preencha esse campo' : ''}
          />
        )}
      />
    </Grid>
  );
};

export default TextInput;
