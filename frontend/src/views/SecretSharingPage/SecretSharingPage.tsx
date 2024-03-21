import { useTranslation } from "react-i18next";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import { DeleteActionModal } from "@app/components/v2";
import { useWorkspace } from "@app/context";
import { usePopUp } from "@app/hooks";
import { useDeleteWsSecretSharing, useGetWsSecretSharing } from "@app/hooks/api";
import { TSecretSharingRes } from "@app/hooks/api/secretSharing/types";

import { HeaderSecretSharing } from "./components/HeaderSecretSharing";
import { ListSecretSharing } from "./components/ListSecretSharing";

export const SecretSharingPage = () => {
  const { t } = useTranslation();

  const { popUp, handlePopUpOpen, handlePopUpClose, handlePopUpToggle } = usePopUp([
    "deleteSecretSharing"
  ] as const);

  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || "";

  const { data } = useGetWsSecretSharing({ workspaceId });
  const { mutateAsync: deleteSecretSharing } = useDeleteWsSecretSharing({ workspaceId });

  const { createNotification } = useNotificationContext();

  async function handleDelete(item: TSecretSharingRes) {
    try {
      if (!item || !item.id) throw new Error("Missing id to delete one-time secret");
      await deleteSecretSharing(item.id);
      handlePopUpClose("deleteSecretSharing");

      createNotification({
        text: "Successfully delete secret sharing.",
        type: "success"
      });
    } catch (err) {
      console.error(err);
      createNotification({
        text: "Failed to delete secret sharing.",
        type: "error"
      });
    }
  }

  return (
    <div className="flex h-full w-full justify-center bg-bunker-800 text-white">
      <div className="w-full max-w-7xl px-6">
        <div className="my-6">
          <p className="text-3xl font-semibold text-gray-200">{t("secret-sharing.title")}</p>
          <div />
        </div>
        <div className="text-md text-bunker-300">
          Create an one-time secret to share with public for short-time.
        </div>
        <HeaderSecretSharing />
        <ListSecretSharing
          secretSharing={data?.secretSharing}
          onDelete={(item) => handlePopUpOpen("deleteSecretSharing", item)}
        />

        <DeleteActionModal
          isOpen={popUp.deleteSecretSharing.isOpen}
          title={`Are you sure want to delete ${
            (popUp?.deleteSecretSharing?.data as { name: string })?.name || ""
          }?`}
          onChange={(isOpen) => handlePopUpToggle("deleteSecretSharing", isOpen)}
          deleteKey={(popUp?.deleteSecretSharing?.data as TSecretSharingRes)?.pathSlug || "delete"}
          onDeleteApproved={() =>
            handleDelete(popUp?.deleteSecretSharing?.data as TSecretSharingRes)
          }
        />
      </div>
    </div>
  );
};
