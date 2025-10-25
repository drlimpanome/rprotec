'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import { DynamicLogo } from '@/components/core/logo';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email é obrigatório' }).email('Email inválido'),
  password: zod.string().min(1, { message: 'Senha é obrigatória' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error, token } = await authClient.signInWithPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      // Refresh the auth state
      await checkSession?.(token);

      // UserProvider, for this case, will not refresh the router
      // After refresh, GuestGuard will handle the redirect
      router.refresh();
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={4}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '8px',
          animation: 'fadeInDown 0.8s ease-out',
          '@keyframes fadeInDown': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        <Box
          sx={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <DynamicLogo height={80} />
        </Box>
      </Box>

      {/* Header */}
      <Stack spacing={2}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'white',
              marginBottom: '8px',
            }}
          >
            Bem-vindo
          </Typography>
          <Typography
            color="text.secondary"
            variant="body1"
            sx={{ fontWeight: 400, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Faça login para continuar
          </Typography>
        </Box>
      </Stack>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)} fullWidth>
                <OutlinedInput
                  {...field}
                  placeholder="seu.email@exemplo.com"
                  type="email"
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      padding: '12px 0px',
                      fontSize: '15px',
                      fontWeight: 400,
                      color: '#ffffff',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #1A0B44 inset !important',
                        WebkitTextFillColor: '#ffffff !important',
                      },
                      '&:-webkit-autofill::first-line': {
                        fontSize: '15px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                      borderBottom: '2px solid',
                      borderBottomColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 0,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderBottomColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderBottomColor: '#4CA7FF',
                      borderBottomWidth: '2px',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                {errors.email ? (
                  <FormHelperText sx={{ fontSize: '12px', marginTop: '6px', color: '#ff6b6b' }}>
                    {errors.email.message}
                  </FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)} fullWidth>
                <OutlinedInput
                  {...field}
                  placeholder="Sua senha"
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <Box
                      onClick={(): void => {
                        setShowPassword(!showPassword);
                      }}
                      sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'rgba(255, 255, 255, 0.6)',
                        transition: 'color 0.2s',
                        '&:hover': {
                          color: '#ffffff',
                        },
                      }}
                    >
                      {showPassword ? (
                        <EyeIcon fontSize="var(--icon-fontSize-md)" />
                      ) : (
                        <EyeSlashIcon fontSize="var(--icon-fontSize-md)" />
                      )}
                    </Box>
                  }
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      padding: '12px 0px',
                      fontSize: '15px',
                      fontWeight: 400,
                      color: '#ffffff',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #1A0B44 inset !important',
                        WebkitTextFillColor: '#ffffff !important',
                      },
                      '&:-webkit-autofill::first-line': {
                        fontSize: '15px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                      borderBottom: '2px solid',
                      borderBottomColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 0,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderBottomColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderBottomColor: '#4CA7FF',
                      borderBottomWidth: '2px',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                {errors.password ? (
                  <FormHelperText sx={{ fontSize: '12px', marginTop: '6px', color: '#ff6b6b' }}>
                    {errors.password.message}
                  </FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          {/* Error Alert */}
          {errors.root ? (
            <Alert
              color="error"
              sx={{
                borderRadius: '8px',
                fontSize: '14px',
                marginTop: '8px',
              }}
            >
              {errors.root.message}
            </Alert>
          ) : null}

          {/* Submit Button */}
          <Button
            disabled={isPending}
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              marginTop: '12px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover:not(:disabled)': {
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(0px)',
              },
              '&:disabled': {
                opacity: 0.7,
              },
            }}
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>

          {/* Footer Links */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center',
              marginTop: '16px',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
              }}
            >
              © 2024 Removido. Todos os direitos reservados.
            </Typography>
          </Box>
        </Stack>
      </form>
    </Stack>
  );
}
