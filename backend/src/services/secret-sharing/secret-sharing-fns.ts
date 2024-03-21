import { TSecretSharing } from "@app/db/schemas";

export const isValidSecret = (currSecret: TSecretSharing) => {
  if (!currSecret || !currSecret.expireAtDate || !currSecret.secretContent) return false;
  const now = new Date().getTime();
  return now < new Date(currSecret.expireAtDate).getTime();
};
