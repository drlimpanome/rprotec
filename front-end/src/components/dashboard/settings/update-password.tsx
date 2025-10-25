import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye, EyeClosed } from '@phosphor-icons/react';
import { Control, Controller, FieldValues } from 'react-hook-form';
// ===================== Zod helper =====================
// Use this helper to compose your schema; keep it optional so you can reuse across pages.
// Example usage below.
import { z as zod } from 'zod';

/**
 * Password + Confirm component for two scenarios:
 * 1) Inside react-hook-form (RHF): pass `control`, `name` and `confirmName`.
 * 2) Standalone (e.g., in a dialog): control via value/onChange pairs.
 *
 * Validations covered (configurable):
 * - minLength (default 8)
 * - requireNumber (at least one digit)
 * - equality (password === confirm)
 */

// ===== Types

type BaseProps = {
  labelPassword?: string;
  labelConfirm?: string;
  idPrefix?: string; // helpful if you render this component more than once on a page
  minLength?: number; // default 8
  requireNumber?: boolean; // default true
  fullWidth?: boolean; // default true
  disabled?: boolean;
  // Show a small caption/description above the fields (optional)
  caption?: React.ReactNode;
  // Fired only in standalone mode when local validation result changes
  onValidityChange?: (valid: boolean) => void;
  // Extra helper texts (shown below each field)
  helperTextPassword?: string;
  helperTextConfirm?: string;
  // Spacing between fields
  spacing?: number;
};

// Standalone/controlled props
export type PasswordConfirmControlledProps = BaseProps & {
  value: string;
  confirmValue: string;
  onChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  errorPassword?: string; // if you want to drive error rendering yourself
  errorConfirm?: string;
};

// RHF-integrated props
export type PasswordConfirmRHFProps<TFieldValues extends FieldValues = FieldValues> = BaseProps & {
  control: Control<TFieldValues>;
  name: string; // e.g. "password"
  confirmName: string; // e.g. "passwordConfirm"
};

// Discriminated union via presence of `control`
export type PasswordConfirmFieldsProps = PasswordConfirmControlledProps | PasswordConfirmRHFProps;

function isRHFProps(p: PasswordConfirmFieldsProps): p is PasswordConfirmRHFProps {
  return (p as PasswordConfirmRHFProps).control !== undefined;
}

export function PasswordConfirmFields(props: PasswordConfirmFieldsProps) {
  const {
    labelPassword = 'Senha',
    labelConfirm = 'Confirmar senha',
    idPrefix = 'pwd',
    minLength = 8,
    requireNumber = true,
    fullWidth = true,
    disabled,
    caption,
    onValidityChange,
    helperTextPassword,
    helperTextConfirm,
    spacing = 2,
  } = props;

  const [showPwd, setShowPwd] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // ===== Standalone mode local validation
  const [localPwdError, setLocalPwdError] = React.useState<string | undefined>();
  const [localConfirmError, setLocalConfirmError] = React.useState<string | undefined>();

  const runLocalValidation = React.useCallback(
    (password: string, confirm: string) => {
      let pwdErr: string | undefined;
      let confirmErr: string | undefined;

      if (password.length < minLength) {
        pwdErr = `A senha deve ter pelo menos ${minLength} caracteres`;
      } else if (requireNumber && !/\d/.test(password)) {
        pwdErr = 'A senha deve conter ao menos um número';
      }

      if (!confirm) {
        // don't force an error if empty; only show mismatch when user typed something
        confirmErr = undefined;
      } else if (password !== confirm) {
        confirmErr = 'As senhas não conferem';
      }

      setLocalPwdError(pwdErr);
      setLocalConfirmError(confirmErr);

      const valid = !pwdErr && !confirmErr && password.length > 0 && confirm.length > 0;
      onValidityChange?.(valid);
    },
    [minLength, onValidityChange, requireNumber]
  );

  // If standalone mode, recompute validity when values change
  React.useEffect(() => {
    if (!isRHFProps(props)) {
      runLocalValidation(props.value, props.confirmValue);
    }
  }, [props, runLocalValidation]);

  // ===== Render helpers
  const renderPasswordField = (value: string, onChange: (v: string) => void, errorMsg?: string) => (
    <FormControl error={Boolean(errorMsg)} fullWidth={fullWidth} disabled={disabled}>
      <InputLabel htmlFor={`${idPrefix}-password`}>{labelPassword}</InputLabel>
      <OutlinedInput
        id={`${idPrefix}-password`}
        type={showPwd ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={labelPassword}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPwd((s) => !s)} edge="end" aria-label="toggle password visibility">
              {showPwd ? <EyeClosed /> : <Eye />}
            </IconButton>
          </InputAdornment>
        }
      />
      {errorMsg ? (
        <FormHelperText>{errorMsg}</FormHelperText>
      ) : helperTextPassword ? (
        <FormHelperText>{helperTextPassword}</FormHelperText>
      ) : null}
    </FormControl>
  );

  const renderConfirmField = (value: string, onChange: (v: string) => void, errorMsg?: string) => (
    <FormControl error={Boolean(errorMsg)} fullWidth={fullWidth} disabled={disabled}>
      <InputLabel htmlFor={`${idPrefix}-confirm`}>{labelConfirm}</InputLabel>
      <OutlinedInput
        id={`${idPrefix}-confirm`}
        type={showConfirm ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={labelConfirm}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" aria-label="toggle confirm visibility">
              {showConfirm ? <EyeClosed /> : <Eye />}
            </IconButton>
          </InputAdornment>
        }
      />
      {errorMsg ? (
        <FormHelperText>{errorMsg}</FormHelperText>
      ) : helperTextConfirm ? (
        <FormHelperText>{helperTextConfirm}</FormHelperText>
      ) : null}
    </FormControl>
  );

  return (
    <Stack spacing={spacing} sx={{ width: fullWidth ? '100%' : undefined }}>
      {caption ? (
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
      ) : null}

      {isRHFProps(props) ? (
        // ========= RHF MODE =========
        <>
          <Controller
            name={props.name}
            control={props.control}
            render={({ field, fieldState }) =>
              renderPasswordField(field.value ?? '', field.onChange, fieldState.error?.message)
            }
          />
          <Controller
            name={props.confirmName}
            control={props.control}
            render={({ field, fieldState }) =>
              renderConfirmField(field.value ?? '', field.onChange, fieldState.error?.message)
            }
          />
        </>
      ) : (
        // ========= STANDALONE MODE =========
        <>
          {renderPasswordField(props.value, props.onChange, props.errorPassword ?? localPwdError)}
          {renderConfirmField(props.confirmValue, props.onConfirmChange, props.errorConfirm ?? localConfirmError)}
        </>
      )}
    </Stack>
  );
}

export const buildPasswordSchema = (minLength = 8, requireNumber = true) =>
  zod
    .object({
      password: zod
        .string({ required_error: 'A senha é obrigatória' })
        .min(minLength, { message: `A senha deve ter pelo menos ${minLength} caracteres` })
        .refine((v) => (requireNumber ? /\d/.test(v) : true), {
          message: 'A senha deve conter ao menos um número',
        }),
      passwordConfirm: zod
        .string({ required_error: 'Confirmação obrigatória' })
        .min(1, { message: 'Confirmação obrigatória' }),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: 'As senhas não conferem',
    });

// ===================== Examples =====================
// 1) Inside your SignUpForm with RHF + Zod
/*
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { buildPasswordSchema, PasswordConfirmFields } from './PasswordConfirmFields';

const schema = zod.object({
  username: zod.string().min(1, { message: 'O nome é obrigatório' }),
  email: zod.string().min(1, { message: 'O email é obrigatório' }).email(),
  document: zod.string().min(11, { message: 'O documento é obrigatório' }),
  phone: zod.string().min(10, { message: 'O telefone é obrigatório' }),
}).and(buildPasswordSchema(6, true));

const { control, handleSubmit, formState: { errors } } = useForm<zod.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { username: '', email: '', document: '', phone: '', password: '', passwordConfirm: '' },
});

// Inside JSX:
<PasswordConfirmFields control={control} name="password" confirmName="passwordConfirm" />
*/

// 2) Standalone usage inside a Dialog (no RHF)
/*
const [pwd, setPwd] = React.useState('');
const [pwd2, setPwd2] = React.useState('');
const [canSubmit, setCanSubmit] = React.useState(false);

<PasswordConfirmFields
  value={pwd}
  confirmValue={pwd2}
  onChange={setPwd}
  onConfirmChange={setPwd2}
  onValidityChange={setCanSubmit}
  minLength={6}
  requireNumber
/>

<Button onClick={() => api.changePassword({ password: pwd })} disabled={!canSubmit}>
  Atualizar senha
</Button>
*/
