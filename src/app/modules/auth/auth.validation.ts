import { z } from 'zod'

const registrationValidationSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'user name is required' }),
    email: z.string({ required_error: 'email is required' }).email(),

    password: z
      .string({
        invalid_type_error: 'Password must be a string',
      })
      .min(6, {
        message: 'Password must be at least 6 characters long, Ex: Pass1#',
      })
      .max(20, {
        message: 'Password cannot be more than 20 characters long, Ex: Pass1#',
      })
      .regex(/[A-Z]/, {
        message:
          'Password must contain at least one uppercase letter, Ex: Pass1#',
      })
      .regex(/[0-9]/, {
        message: 'Password must contain at least one number, Ex: Pass1#',
      })
      .regex(/[^a-zA-Z0-9]/, {
        message:
          'Password must contain at least one special character, Ex: Pass1#',
      }),

    role: z.enum(['user', 'admin']),
  }),
})

const loginValidationSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'user name is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
})

const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'old password is required' }),
    newPassword: z
      .string({
        invalid_type_error: 'Password must be a string',
      })
      .min(6, {
        message: 'Password must be at least 6 characters long, Ex: Pass1#',
      })
      .max(20, {
        message: 'Password cannot be more than 20 characters long, Ex: Pass1#',
      })
      .regex(/[A-Z]/, {
        message:
          'Password must contain at least one uppercase letter, Ex: Pass1#',
      })
      .regex(/[0-9]/, {
        message: 'Password must contain at least one number, Ex: Pass1#',
      })
      .regex(/[^a-zA-Z0-9]/, {
        message:
          'Password must contain at least one special character, Ex: Pass1#',
      }),
  }),
})

export const AuthValidation = {
  registrationValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
}
