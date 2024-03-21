import { twMerge } from "tailwind-merge";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import { EmptyState, Select, SelectItem } from "@app/components/v2";
import { TSecretSharingRes } from "@app/hooks/api/secretSharing/types";

type Props = {
  secretSharing?: TSecretSharingRes[];
  onDelete?: (item: TSecretSharingRes) => void;
};

export const ListSecretSharing = ({ secretSharing, onDelete }: Props) => {
  const { createNotification } = useNotificationContext();

  function handleValueChange(value: string, item: TSecretSharingRes) {
    const url = `${window.location.origin}/l/${item.pathSlug}` ?? "";
    switch (value) {
      case "copy":
        navigator.clipboard.writeText(url);

        createNotification({
          text: "Successfully copied url to clipboard.",
          type: "success"
        });
        break;
      case "open":
        window.open(url, "blank");
        break;
      case "duration":
        // Todo: Open update duration modal
        break;
      case "delete":
        onDelete?.(item);
        break;
      default:
    }
  }

  return (
    <div className="mt-2 flex flex-col space-y-4 pt-0">
      {secretSharing?.length ? (
        secretSharing?.map((item, i) => {
          const isActive = new Date(item.expireAtDate).getTime() > new Date().getTime();
          const url = `${window?.location?.origin}/l/${item.pathSlug}`
          return (
            <div
              className="max-w-8xl flex justify-between rounded-md border border-mineshaft-600 bg-mineshaft-800 p-3"
              key={`secret-share-${i + 1}`}
            >
              <div className="flex items-center justify-start gap-4">
                <a href={url} target="_blank" rel="noreferrer">
                  <div className="text-lg text-bunker-200 hover:underline">
                    <span className="text-bunker-400">{window?.location?.origin}/l/</span>
                    {item.pathSlug}
                  </div>
                </a>
                <div
                  className={twMerge(
                    "flex h-6 items-center rounded-lg bg-bunker-900 px-4 py-0 text-sm text-white",
                    !isActive && "bg-bunker-400 text-bunker-200"
                  )}
                >
                  {isActive ? "Active" : "Expired"}
                </div>
              </div>
              <div className="flex">
                <Select
                  value=""
                  className="bg-mineshaft-800"
                  onValueChange={(value) => handleValueChange(value, item)}
                >
                  <SelectItem value="copy">Copy the link</SelectItem>
                  <SelectItem value="open">Open the link</SelectItem>
                  <SelectItem value="duration">Update Duration</SelectItem>
                  <SelectItem value="delete" className="text-red">
                    Delete
                  </SelectItem>
                </Select>
              </div>
            </div>
          );
        })
      ) : (
        <EmptyState
          className="mx-0 my-4 rounded-md border border-mineshaft-700 pt-8 pb-4"
          title="No one-time secrets found. Create a new one to manage your one-time secrets."
        />
      )}
    </div>
  );
};
