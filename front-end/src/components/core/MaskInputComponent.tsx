import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

const applyDynamicMask = (value: string): string => {
  const cleanedValue = value?.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (cleanedValue?.length <= 11) {
    // CPF
    return cleanedValue
      ?.replace(/(\d{3})(\d)/, '$1.$2')
      ?.replace(/(\d{3})(\d)/, '$1.$2')
      ?.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ
    return cleanedValue
      ?.replace(/(\d{2})(\d)/, '$1.$2')
      ?.replace(/(\d{3})(\d)/, '$1.$2')
      ?.replace(/(\d{3})(\d{4})(\d{1,2})$/, '$1/$2-$3');
  }
};

const applyPhoneMask = (value: string): string => {
  const cleanedValue = value?.replace(/\D/g, ''); // Remove caracteres não numéricos
  return cleanedValue?.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
};

const applyMask = (value: string, maskType: 'cpf_cnpj' | 'telefone'): string => {
  if (maskType === 'cpf_cnpj') {
    return applyDynamicMask(value);
  } else if (maskType === 'telefone') {
    return applyPhoneMask(value);
  }
  return value;
};

interface MaskInputTextProps extends Omit<TextFieldProps, 'onChange'> {
  maskType: 'cpf_cnpj' | 'telefone';
  value: string;
  onChange: any;
  disabled?: boolean;
}

const MaskInputText: React.FC<MaskInputTextProps> = ({ maskType, value, onChange, ...textFieldProps }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e?.target?.value?.replace(/\D/g, '');
    const maskedValue = applyMask(rawValue, maskType);
    onChange(rawValue); // Retorna valor sem máscara
  };

  return (
    <TextField
      {...textFieldProps}
      value={applyMask(value, maskType)} // Exibe o valor mascarado
      onChange={handleChange}
      inputProps={{ maxLength: maskType === 'telefone' ? 15 : 18 }} // Limita o número de caracteres
      error={textFieldProps.error}
      disabled={textFieldProps.disabled}
    />
  );
};

export default MaskInputText;
