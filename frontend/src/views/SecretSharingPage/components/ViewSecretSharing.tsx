import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import { Button, FormLabel, Input, TextArea } from "@app/components/v2";
import { decrypt } from "@app/helpers/secretSharing";
import {
  useRevealSecretSharing,
  useValidSecretSharing
} from "@app/hooks/api/secretSharing/queries";

enum ViewState {
  Loading = "loading",
  Valid = "valid",
  Revealed = "reveal",
  RequirePassword = "password",
  Invalid = "invalid"
}

export const ViewSecretSharing = () => {
  const { createNotification } = useNotificationContext();

  const router = useRouter();
  const [currView, setCurrView] = useState<ViewState>(ViewState.Loading);
  const [password, setPassword] = useState<string>();
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

  function tryDecrypt() {
    if (!revealSecret) return;
    decrypt(revealSecret.cipher, revealSecret.iv, password)
      .then((decryptedSecret) => {
        setDecryptSecret(decryptedSecret.data);
        setCurrView(ViewState.Revealed);
      })
      .catch((err) => {
        console.error(err);
        createNotification({
          text: "Failed to decrypt secret",
          type: "error"
        });
        setCurrView(ViewState.Invalid);
      });
  }

  useEffect(() => {
    if (!revealSecret) return;
    console.log({ a: revealSecret.isPasswordProtected, revealSecret });
    if (revealSecret.isPasswordProtected) {
      setCurrView(ViewState.RequirePassword);
    } else {
      tryDecrypt();
    }
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
      {ViewState.RequirePassword === currView && (
        <div className="h-5/12 flex w-5/12 flex-col items-center justify-center gap-2 rounded-md bg-bunker-500 p-2">
          <p className="mb-2 text-2xl">Content is encrypted</p>
          <p className="text-md text-gray-400">Enter password to decrypt!</p>

          <div className="w-60">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button size="xs" onClick={() => tryDecrypt()} className="py-2 px-4">
            Submit
          </Button>
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
