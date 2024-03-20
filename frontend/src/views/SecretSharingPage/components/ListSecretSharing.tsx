import { EmptyState } from "@app/components/v2";

type SecretSharing = {
  expireUnit: "day" | "min";
  expireAt: number;
  hasRead: boolean;
  link: string;
  createdAt: string;
};
type Props = {
  secretSharing: SecretSharing[];
};

export const ListSecretSharing = ({ secretSharing }: Props) => {
  return (
    <div className="flex flex-col space-y-4 pt-0">
      {secretSharing.length ? (
        secretSharing?.map((item, i) => (
          <div
            className="max-w-8xl flex justify-between rounded-md border border-mineshaft-600 bg-mineshaft-800 p-3"
            key={`secret-share-${i + 1}`}
          >
            Secrets
          </div>
        ))
      ) : (
        <EmptyState
          className="mx-0 my-4 rounded-md border border-mineshaft-700 pt-8 pb-4"
          title="No temporary secrets found. Create a new one to manage your temporary secrets."
        />
      )}
    </div>
  );
};
