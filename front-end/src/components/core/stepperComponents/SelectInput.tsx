import React from 'react';
import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  name: string;
  label: string;
  size: number;
  required: boolean;
  control: Control<any>;
  errors: FieldErrors;
  options: SelectOption[];
  defaultValue?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  name,
  label,
  size,
  required,
  control,
  errors,
  options,
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
          <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select {...field}>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </Grid>
  );
};

export default SelectInput;
