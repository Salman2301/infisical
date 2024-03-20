import { useTranslation } from "react-i18next";
import Head from "next/head";

import { SecretSharingPage } from "@app/views/SecretSharingPage";

const SecretSharing = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("common.head-title", { title: t("secret-sharing.title") })}</title>
        <link rel="icon" href="/infisical.ico" />
      </Head>
      <SecretSharingPage />
    </>
  );
};

export default SecretSharing;

SecretSharing.requireAuth = true;
