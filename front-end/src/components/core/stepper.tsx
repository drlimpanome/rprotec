import React, { useEffect, useState } from 'react';
import { masks } from '@/utils/masks';
import { Box, Button, Card, Grid, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useForm } from 'react-hook-form';

import { StepsFormConfig } from '@/types/stepper.types';

import DynamicListInput from '../dashboard/logistic/dynamic-list';
import MaskInput from './stepperComponents/MaskInput';
import SelectInput from './stepperComponents/SelectInput';
import TextInput from './stepperComponents/TextInput';

interface StepsFormProps {
  config: Omit<StepsFormConfig, 'onsubmitFun'>;
  onSubmit: (formData: Record<string, any>) => void;
}

const StepsForm: React.FC<StepsFormProps> = ({ config, onSubmit }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useForm();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    config.steps.forEach((step, stepIndex) => {
      step.formdata?.forEach((field, fieldIndex) => {
        const fieldName = `step${stepIndex}-${fieldIndex}`;
        const defaultValue = field.defaultValue || '';
        setValue(fieldName, defaultValue);
      });
    });
  }, [config, setValue]);

  const isLastStep = () => activeStep === config.steps.length - 1;

  const validateCurrentStep = async () => {
    const currentStepFields = config.steps[activeStep].formdata?.map((_, index) => `step${activeStep}-${index}`);
    return await trigger(currentStepFields);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const internalOnSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (isLastStep()) {
        handleSubmit((data: any) => {
          const mappedData = Object.keys(data).reduce(
            (acc, key) => {
              const [stepIndex, fieldIndex] = key.replace('step', '').split('-');
              const fieldConfig = config.steps[parseInt(stepIndex)].formdata?.[parseInt(fieldIndex)];
              const dbColumn = fieldConfig?.dbColumn;
              if (dbColumn) {
                acc[dbColumn] = data[key];
              }
              return acc;
            },
            {} as Record<string, any>
          );
          onSubmit(mappedData);
        })();
      } else {
        handleNext();
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {config.titleOfStepper}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {config.subtitle}
        </Typography>

        <Stepper activeStep={activeStep}>
          {config.steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      <Card sx={{ p: 2 }}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            internalOnSubmit();
          }}
        >
          <Box sx={{ mt: 3 }}>
            {config.steps.map((step, index) => (
              <Box key={index} hidden={index !== activeStep}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {step.subtitle}
                </Typography>

                <Grid container spacing={2}>
                  {step.formdata?.map((field, fieldIndex) => {
                    const fieldName = `step${index}-${fieldIndex}`;
                    if (field.type === 'list') {
                      return (
                        <Grid item xs={12} key={fieldIndex}>
                          <DynamicListInput onChange={(listData) => setValue(fieldName, listData)} />
                        </Grid>
                      );
                    } else if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
                      return (
                        <TextInput
                          key={fieldIndex}
                          name={fieldName}
                          label={field.label}
                          type={field.type}
                          size={field.size}
                          required={field.required}
                          control={control}
                          errors={errors}
                          defaultValue={getValues(fieldName) || field.defaultValue || ''}
                        />
                      );
                    } else if (field.type === 'select') {
                      return (
                        <SelectInput
                          key={fieldIndex}
                          name={fieldName}
                          label={field.label}
                          size={field.size}
                          required={field.required}
                          control={control}
                          errors={errors}
                          options={field.options || []}
                          defaultValue={getValues(fieldName) || field.defaultValue || ''}
                        />
                      );
                    } else if (field.type === 'mask') {
                      return (
                        <MaskInput
                          key={fieldIndex}
                          name={fieldName}
                          label={field.label}
                          size={field.size}
                          required={field.required}
                          control={control}
                          errors={errors}
                          mask={masks[field.mask || 'process']}
                          defaultValue={getValues(fieldName) || field.defaultValue || ''}
                          notEditable={field.notEditable}
                        />
                      );
                    }
                    return null;
                  })}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  {activeStep > 0 && (
                    <Button variant="outlined" onClick={handleBack}>
                      Voltar
                    </Button>
                  )}
                  <Button variant="contained" type="submit">
                    {isLastStep() ? config.savebuttonText : 'Proximo'}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </form>
      </Card>
    </Stack>
  );
};

export default StepsForm;
