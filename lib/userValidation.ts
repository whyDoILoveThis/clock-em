import { z } from 'zod';

export const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  fullName: z.string().min(1, 'Full name is required'),
  age: z.string().min(2, 'Age must be a positive number'),
  phone: z.string().min(10, 'Phone is required'),
  address: z.string().min(10, 'Phone is required'),
});

export type UserFormData = z.infer<typeof userFormSchema>;
