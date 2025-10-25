'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Importa o hook para buscar os parâmetros da URL

import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

import MaskInputText from '../core/MaskInputComponent';
import { buildPasswordSchema, PasswordConfirmFields } from '../dashboard/settings/update-password';

const schema = zod
  .object({
    username: zod.string().min(1, { message: 'O nome é obrigatório' }),
    email: zod.string().min(1, { message: 'O email é obrigatório' }).email(),
    password: zod.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
    document: zod
      .string()
      .min(11, { message: 'O documento é obrigatório' })
      .refine(
        (value) => {
          const unmasked = value.replace(/\D/g, ''); // Remove máscara
          return cpf.isValid(unmasked) || cnpj.isValid(unmasked);
        },
        { message: 'Documento inválido' }
      ),
    phone: zod.string().min(10, { message: 'O telefone é obrigatório' }),
  })
  .and(buildPasswordSchema(6, true));

type Values = zod.infer<typeof schema>;

const defaultValues = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  document: '',
  phone: '',
} satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams(); // Obtem os parâmetros da URL

  const affiliateEmail = searchParams.get('affiliate');
  const { checkSession } = useUser();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      try {
        setIsPending(true);
        const payload = { ...values, affiliate: affiliateEmail }; // Inclui o email do afiliado nos valores enviados
        const { error } = await authClient.signUp(payload);

        if (error) {
          setError('root', { type: 'server', message: error });
          setIsPending(false);
          return;
        }

        // Refresh the auth state
        await checkSession?.();

        // UserProvider, for this case, will not refresh the router
        // After refresh, GuestGuard will handle the redirect
        router.refresh();
      } catch (error: any) {
        setError('root', { type: 'server', message: error?.response?.data?.message || error.message });
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, router, setError, affiliateEmail]
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign up</Typography>
        <Typography color="text.secondary" variant="body2">
          Ja tem uma conta ?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
            Entrar
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)}>
                <InputLabel>Nome de usuario</InputLabel>
                <OutlinedInput {...field} label="Nome de usuario" />
                {errors.username ? <FormHelperText>{errors.username.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>E-mail</InputLabel>
                <OutlinedInput {...field} label="E-mail" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="document"
            render={({ field }) => (
              <FormControl error={Boolean(errors.document)}>
                <MaskInputText maskType="cpf_cnpj" value={field.value} onChange={field.onChange} label="Documento" />
                {errors.document ? <FormHelperText>{errors.document.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <FormControl error={Boolean(errors.phone)}>
                <MaskInputText maskType="telefone" value={field.value} onChange={field.onChange} label="Telefone" />
                {errors.phone ? <FormHelperText>{errors.phone.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <PasswordConfirmFields
            control={control as any}
            name="password"
            confirmName="passwordConfirm"
            minLength={6} // opcional (o padrão é 8)
            requireNumber // opcional (default: true)
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            Criar conta
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
