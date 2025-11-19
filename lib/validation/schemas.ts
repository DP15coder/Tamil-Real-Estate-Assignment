import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const transactionFilterSchema = z.object({
  claimant: z.string().optional(),
  executant: z.string().optional(),
  surveyNumber: z.string().optional(),
  documentNumber: z.string().optional(),
  houseNumber: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const uploadSchema = z.object({
  file: z.instanceof(File),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

