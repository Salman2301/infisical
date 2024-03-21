import Head from "next/head";

import { ViewSecretSharing } from "@app/views/SecretSharingPage/components/ViewSecretSharing";

export default function OneTimeSecret() {
  return (
    <div className="flex flex-col justify-between bg-bunker-800 md:h-screen">
      <Head>
        <title>Infisical One-time secrets!</title>
        <link rel="icon" href="/infisical.ico" />
      </Head>
      <ViewSecretSharing />
    </div>
  );
}
