import React from 'react';
import { Grid, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import MaskedInput from 'react-text-mask'; // Dependendo de qual biblioteca de máscara você está usando

interface MaskedInputProps {
  name: string;
  label: string;
  size: number;
  required: boolean;
  control: Control<any>;
  errors: FieldErrors;
  mask: (string | RegExp)[];
  defaultValue?: string;
  notEditable?: boolean;
}

const MaskInput: React.FC<MaskedInputProps> = ({
  name,
  label,
  size,
  required,
  control,
  errors,
  mask,
  defaultValue = '',
  notEditable,
}) => {
  return (
    <Grid item xs={12} md={size}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{ required }}
        render={({ field }) => (
          <MaskedInput
            mask={mask}
            value={field.value}
            onChange={field.onChange}
            disabled={notEditable !== undefined}
            render={(ref: any, props: any) => (
              <TextField
                InputLabelProps={{ shrink: true }}
                {...props}
                inputRef={ref}
                name={name}
                id={name}
                label={label}
                type="text"
                fullWidth
                error={!!errors[name]}
                helperText={errors[name] ? 'Preencha esse campo' : ''}
              />
            )}
          />
        )}
      />
    </Grid>
  );
};

export default MaskInput;
