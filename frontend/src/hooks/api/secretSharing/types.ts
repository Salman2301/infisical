export type TSecretSharingRes = {
  id: string;
  read: boolean;
} & TSecretSharing;


export type TSecretSharing = {
  secretContent: string;
  read?: boolean;
  readOnlyOnce: boolean;
  pathSlug: string;
  expireAtDate: Date;
  expireAtValue: string;
  expireAtUnit: "min" | "hour" | "day";
  projectId: string;
}
