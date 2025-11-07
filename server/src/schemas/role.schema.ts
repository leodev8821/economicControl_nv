import { z } from "zod";
import { RoleType } from "../models/role.model";

const roleTypes = Object.values(RoleType) as [RoleType, ...RoleType[]];

export const RoleCreationSchema = z.object({
    
    source: z.enum(roleTypes, {
        error: "La fuente de ingreso es obligatoria",
    }),

});

export type RoleCreationRequest = z.infer<typeof RoleCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const RoleUpdateSchema = RoleCreationSchema.partial();
export type RoleUpdateRequest = z.infer<typeof RoleUpdateSchema>;