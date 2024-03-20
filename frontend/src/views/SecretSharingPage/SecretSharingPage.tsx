import { useTranslation } from "react-i18next";

import { HeaderSecretSharing } from "./components/HeaderSecretSharing";
import { ListSecretSharing } from "./components/ListSecretSharing";

export const SecretSharingPage = () => {
  const { t } = useTranslation();
  const secretSharing: any[] = [];

  return (
    <div className="flex h-full w-full justify-center bg-bunker-800 text-white">
      <div className="w-full max-w-7xl px-6">
        <div className="my-6">
          <p className="text-3xl font-semibold text-gray-200">{t("secret-sharing.title")}</p>
          <div />
        </div>
        <div className="text-md text-bunker-300">
        Create a temporary secret to share with public for short time.
        </div>
        <HeaderSecretSharing />
        <ListSecretSharing secretSharing={secretSharing} />
      </div>
    </div>
  );
};
