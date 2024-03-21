import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { FormLabel, TextArea } from "@app/components/v2";
import { decrypt } from "@app/helpers/secretSharing";
import {
  useRevealSecretSharing,
  useValidSecretSharing
} from "@app/hooks/api/secretSharing/queries";

enum ViewState {
  Loading = "loading",
  Valid = "valid",
  Revealed = "reveal",
  Invalid = "invalid"
}

export const ViewSecretSharing = () => {
  const router = useRouter();
  const [currView, setCurrView] = useState<ViewState>(ViewState.Loading);
  const [pathSlug, setPathSlug] = useState<string>("");
  const [decryptSecret, setDecryptSecret] = useState<string>("");

  const { data: validSecret, isLoading } = useValidSecretSharing({ slug: pathSlug });
  const { data: revealSecret } = useRevealSecretSharing({ slug: pathSlug, isValid: !!validSecret });

  useEffect(() => {
    const pathName = typeof router.query.id === "string" && router.query.id ? router.query.id : "";
    setPathSlug(pathName);
  }, [router?.query?.id]);

  useEffect(() => {
    if (!isLoading && !validSecret) setCurrView(ViewState.Invalid);
  }, [validSecret, isLoading]);

  useEffect(() => {
    if (!revealSecret) return;
    decrypt(revealSecret.cipher, revealSecret.iv)
      .then((decryptedSecret) => {
        setDecryptSecret(decryptedSecret.data);
        setCurrView(ViewState.Revealed);
      })
      .catch((err) => {
        console.error(err);
        setCurrView(ViewState.Invalid);
      });
  }, [revealSecret]);

  return (
    <div className="-mt-8 flex h-screen w-screen flex-col items-center justify-center text-gray-200">
      {ViewState.Loading === currView && <p>Loading...</p>}
      {ViewState.Revealed === currView && (
        <div className="w-[480px]">
          <FormLabel label="Your secret" />
          <TextArea rows={8} value={decryptSecret!} readOnly className="ring-1" />
        </div>
      )}
      {ViewState.Invalid === currView && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md bg-bunker-500 px-12 py-8 ring-1 ring-red-500/60 ">
          <FontAwesomeIcon icon={faExclamationTriangle} size="2xl" />
          <p className="my-4 text-lg text-gray-400">Failed to find or decrypt the secret!</p>
        </div>
      )}
    </div>
  );
};
