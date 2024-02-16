// Code generated by automation script, DO NOT EDIT.
// Automated by pulling database and generating zod schema
// To update. Just run npm run generate:schema
// Written by akhilmhdh.

import { z } from "zod";

import { TImmutableDBKeys } from "./models";

export const OrgBotsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  publicKey: z.string(),
  encryptedSymmetricKey: z.string(),
  symmetricKeyIV: z.string(),
  symmetricKeyTag: z.string(),
  symmetricKeyAlgorithm: z.string(),
  symmetricKeyKeyEncoding: z.string(),
  encryptedPrivateKey: z.string(),
  privateKeyIV: z.string(),
  privateKeyTag: z.string(),
  privateKeyAlgorithm: z.string(),
  privateKeyKeyEncoding: z.string(),
  orgId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type TOrgBots = z.infer<typeof OrgBotsSchema>;
export type TOrgBotsInsert = Omit<TOrgBots, TImmutableDBKeys>;
export type TOrgBotsUpdate = Partial<Omit<TOrgBots, TImmutableDBKeys>>;
