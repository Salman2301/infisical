// Code generated by automation script, DO NOT EDIT.
// Automated by pulling database and generating zod schema
// To update. Just run npm run generate:schema
// Written by akhilmhdh.

import { z } from "zod";

import { TImmutableDBKeys } from "./models";

export const IdentityOrgMembershipsSchema = z.object({
  id: z.string().uuid(),
  role: z.string(),
  roleId: z.string().uuid().nullable().optional(),
  orgId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  identityId: z.string().uuid()
});

export type TIdentityOrgMemberships = z.infer<typeof IdentityOrgMembershipsSchema>;
export type TIdentityOrgMembershipsInsert = Omit<TIdentityOrgMemberships, TImmutableDBKeys>;
export type TIdentityOrgMembershipsUpdate = Partial<Omit<TIdentityOrgMemberships, TImmutableDBKeys>>;
