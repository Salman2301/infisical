export type UseWsSecretSharingMutationProps = {
  workspaceId: string
};

export type UseWsSecretSharingDurationMutationProps = {
  workspaceId: string;
  secretSharingId: string;
}

export type TSecretSharingRes = {
  id: string;
  read: boolean;
  lastReadAt: Date;
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
  iv: string;
  isPasswordProtected?: boolean;
}

export type TSecretSharingDuration = {
  expireAtDate: Date;
  expireAtValue: string;
  expireAtUnit: "min" | "hour" | "day";
}
