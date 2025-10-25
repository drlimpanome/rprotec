export interface FormField {
  type: 'text' | 'number' | 'date' | 'select' | 'mask' | 'list';
  options?: { label: string; value: string }[]; // Only for select type
  label: string;
  size: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // Grid size from 1 to 12
  required: boolean;
  defaultValue?: string;
  notEditable?: boolean;
  mask?: 'cpf' | 'cnpj' | 'phone' | 'process' | 'time';
  dbColumn: string;
}

export interface StepsFormConfig {
  savebuttonText: string;
  subtitle: string;
  onsubmitFun?: (formData: Record<string, any>) => void;
  titleOfStepper: string;
  steps: {
    title: string;
    subtitle: string;
    formdata: FormField[];
  }[];
}
