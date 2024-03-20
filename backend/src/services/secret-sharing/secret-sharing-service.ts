import { TSecretSharingDALFactory } from "./secret-sharing-dal";

type TSecretSharingServiceFactoryDep = {
  secretSharingDAL: TSecretSharingDALFactory;
};

export type TSecretSharingServiceFactory = ReturnType<typeof secretSharingServiceFactory>;

export const secretSharingServiceFactory = ({ secretSharingDAL }: TSecretSharingServiceFactoryDep) => {
  // secretSharingDAL
  const validSecretSharing = async (id: string): Promise<boolean> => {
    const currSecret = await secretSharingDAL.findOne({ id });
    if (!currSecret || !currSecret.expiresAt) return false;
    const now = new Date().getTime();
    return now < new Date(currSecret.expiresAt).getTime();
  };
  return {
    validSecretSharing
  };
};
