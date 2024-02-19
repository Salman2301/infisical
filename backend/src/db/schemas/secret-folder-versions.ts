// Code generated by automation script, DO NOT EDIT.
// Automated by pulling database and generating zod schema
// To update. Just run npm run generate:schema
// Written by akhilmhdh.

import { z } from "zod";

import { TImmutableDBKeys } from "./models";

export const SecretFolderVersionsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  version: z.number().default(1).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  envId: z.string().uuid(),
  folderId: z.string().uuid()
});

export type TSecretFolderVersions = z.infer<typeof SecretFolderVersionsSchema>;
export type TSecretFolderVersionsInsert = Omit<TSecretFolderVersions, TImmutableDBKeys>;
export type TSecretFolderVersionsUpdate = Partial<Omit<TSecretFolderVersions, TImmutableDBKeys>>;
