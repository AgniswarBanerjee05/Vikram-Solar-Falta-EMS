const { z } = require('zod');

const emailSchema = z.string().email().transform((value) => value.toLowerCase());

const adminRegistrationSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().trim().optional()
});

const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const userCreationSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(1).optional(),
  password: z.string().min(8).optional()
});

const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  fullName: z.string().trim().min(1).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional()
});

const userPasswordResetSchema = z.object({
  password: z.string().min(8).optional()
});

const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

const userChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

module.exports = {
  adminRegistrationSchema,
  adminLoginSchema,
  userCreationSchema,
  userUpdateSchema,
  userPasswordResetSchema,
  userLoginSchema,
  userChangePasswordSchema
};
