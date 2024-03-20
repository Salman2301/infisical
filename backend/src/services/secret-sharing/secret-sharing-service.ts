import { TSecretSharing } from "@app/db/schemas";

import { TSecretSharingDALFactory } from "./secret-sharing-dal";

type TSecretSharingServiceFactoryDep = {
  secretSharingDAL: TSecretSharingDALFactory;
};

export type TSecretSharingServiceFactory = ReturnType<typeof secretSharingServiceFactory>;

export const secretSharingServiceFactory = ({ secretSharingDAL }: TSecretSharingServiceFactoryDep) => {
  // secretSharingDAL
  const listSecretSharing = async ({ projectId }: { projectId: string }): Promise<TSecretSharing[]> => {
    let secrets = await secretSharingDAL.find({ projectId });
    secrets = secrets.map((secret) => ({ ...secret, secretContent: "" }));
    return secrets;
  };

  const validSecretSharing = async (id: string): Promise<boolean> => {
    const currSecret = await secretSharingDAL.findOne({ id });
    if (!currSecret || !currSecret.expireAtDate) return false;
    const now = new Date().getTime();
    return now < new Date(currSecret.expireAtDate).getTime();
  };

  const createSecretSharing: TSecretSharingDALFactory["create"] = async (data): Promise<TSecretSharing> => {
    // TODO: ENCRYPT THE CONTENT BEFORE STORING
    const newSecretSharing = await secretSharingDAL.create(data);
    return newSecretSharing;
  };

  const deleteSecretSharing = async (id: string): Promise<{ secretSharing: TSecretSharing }> => {
    const secretSharing = await secretSharingDAL.delete({ id });
    return { secretSharing: secretSharing[0] };
  };

  return {
    validSecretSharing,
    listSecretSharing,
    createSecretSharing,
    deleteSecretSharing
  };
};
