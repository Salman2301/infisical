import { TSecretSharing } from "@app/db/schemas";

import { TSecretSharingDALFactory } from "./secret-sharing-dal";

type TSecretSharingServiceFactoryDep = {
  secretSharingDAL: TSecretSharingDALFactory;
};

type TSecretSharingUpdate = {
  id: string;
  projectId: string;
  expireAtValue: number;
  expireAtDate: Date;
  expireAtUnit: string;
};

type TSecretSharingRevealRes = { cipher: string; iv: string; isPasswordProtected: boolean };
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

  const updateSecretSharing = async (data: TSecretSharingUpdate): Promise<TSecretSharing> => {
    const { id, ...restData } = data;
    const updatedSecretSharing = await secretSharingDAL.updateById(id, restData);
    return updatedSecretSharing;
  };

  const deleteSecretSharing = async (id: string): Promise<{ secretSharing: TSecretSharing }> => {
    const secretSharing = await secretSharingDAL.delete({ id });
    return { secretSharing: secretSharing[0] };
  };

  // Publish secret sharing services
  type FindByPathSlug = { pathSlug: string };

  function isValidSecret(currSecret: TSecretSharing) {
    if (!currSecret || !currSecret.expireAtDate || !currSecret.secretContent) return false;
    const now = new Date().getTime();
    return now < new Date(currSecret.expireAtDate).getTime();
  }

  const isPathTaken = async (pathSlug: string): Promise<boolean> => {
    const currSecret = await secretSharingDAL.findOne({ pathSlug });
    return !!currSecret;
  };

  const validSecretSharing = async ({ pathSlug }: FindByPathSlug): Promise<boolean> => {
    const currSecret = await secretSharingDAL.findOne({ pathSlug });
    return isValidSecret(currSecret);
  };

  const revealSecretSharing = async ({ pathSlug }: FindByPathSlug): Promise<TSecretSharingRevealRes> => {
    const currSecret = await secretSharingDAL.findOne({ pathSlug });
    if (!isValidSecret(currSecret)) throw new Error("Invalid secret");
    if (currSecret.readOnlyOnce) {
      await secretSharingDAL.deleteById(currSecret.id);
    } else {
      await secretSharingDAL.updateById(currSecret.id, { read: true, lastReadAt: new Date() });
    }
    return {
      cipher: currSecret.secretContent,
      iv: currSecret.iv,
      isPasswordProtected: !!currSecret.isPasswordProtected
    };
  };

  return {
    validSecretSharing,
    isPathTaken,
    listSecretSharing,
    createSecretSharing,
    revealSecretSharing,
    updateSecretSharing,
    deleteSecretSharing
  };
};
