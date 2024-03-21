import { TSecretSharing } from "@app/db/schemas";

import { TSecretSharingDALFactory } from "./secret-sharing-dal";

type TSecretSharingServiceFactoryDep = {
  secretSharingDAL: TSecretSharingDALFactory;
};

export type TSecretSharingServiceFactory = ReturnType<typeof secretSharingServiceFactory>;

export const secretSharingServiceFactory = ({ secretSharingDAL }: TSecretSharingServiceFactoryDep) => {
  // secretSharingDAL
  const listSecretSharing = async ({ projectId }: { projectId: string }): Promise<TSecretSharing[]> => {
    let secrets = await secretSharingDAL.find({ projectId }, { sort: [["createdAt", "desc"]] });
    secrets = secrets.map((secret) => ({ ...secret, secretContent: "" }));
    return secrets;
  };

  const createSecretSharing: TSecretSharingDALFactory["create"] = async (data): Promise<TSecretSharing> => {
    const newSecretSharing = await secretSharingDAL.create(data);
    return newSecretSharing;
  };

  const deleteSecretSharing = async (id: string): Promise<{ secretSharing: TSecretSharing }> => {
    const secretSharing = await secretSharingDAL.delete({ id });
    return { secretSharing: secretSharing[0] };
  };

  type FindByPathSlug = { pathSlug: string };

  function isValidSecret(currSecret: TSecretSharing) {
    if (!currSecret || !currSecret.expireAtDate || !currSecret.secretContent) return false;
    const now = new Date().getTime();
    return now < new Date(currSecret.expireAtDate).getTime();
  }

  const validSecretSharing = async ({ pathSlug }: FindByPathSlug): Promise<boolean> => {
    const currSecret = await secretSharingDAL.findOne({ pathSlug });
    return isValidSecret(currSecret);
  };

  const revealSecretSharing = async ({ pathSlug }: FindByPathSlug): Promise<{ cipher: string; iv: string }> => {
    const currSecret = await secretSharingDAL.findOne({ pathSlug });
    if (!isValidSecret(currSecret)) throw new Error("Invalid secret");
    if (currSecret.readOnlyOnce) {
      await secretSharingDAL.deleteById(currSecret.id);
    }
    return {
      cipher: currSecret.secretContent,
      iv: currSecret.iv
    };
  };

  return {
    validSecretSharing,
    listSecretSharing,
    createSecretSharing,
    revealSecretSharing,
    deleteSecretSharing
  };
};
