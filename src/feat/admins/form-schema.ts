import { z } from "zod";
import { adminProfileSchema, createAdminSchema } from "./schema";

export const createAdminFormSchema = createAdminSchema.extend({
  position: adminProfileSchema.shape.position.unwrap(),
});
export const adminFormSchema = createAdminFormSchema.extend({ password: z.string() });
export type AdminFormValues = z.infer<typeof adminFormSchema>;
