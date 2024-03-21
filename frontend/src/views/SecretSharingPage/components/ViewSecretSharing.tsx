import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { faCheck, faCopy, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import { Button, FormLabel, IconButton, Input, TextArea } from "@app/components/v2";
import { decrypt } from "@app/helpers/secretSharing";
import { useToggle } from "@app/hooks";
import {
  useRevealSecretSharing,
  useValidSecretSharing
} from "@app/hooks/api/secretSharing/queries";

enum ViewState {
  Loading = "loading",
  Valid = "valid",
  Revealed = "reveal",
  isPasswordProtected = "password",
  Invalid = "invalid"
}

export const ViewSecretSharing = () => {
  const { createNotification } = useNotificationContext();

  const router = useRouter();
  const [currView, setCurrView] = useState<ViewState>(ViewState.Loading);
  const [password, setPassword] = useState<string>();
  const [pathSlug, setPathSlug] = useState<string>("");
  const [decryptSecret, setDecryptSecret] = useState<string>("");
  const [isCopied, setIsCopied] = useToggle(false);

  const { data: validSecret, isLoading } = useValidSecretSharing({ slug: pathSlug });
  const { data: revealSecret } = useRevealSecretSharing({ slug: pathSlug, isValid: !!validSecret });

  useEffect(() => {
    const pathName = typeof router.query.id === "string" && router.query.id ? router.query.id : "";
    setPathSlug(pathName);
  }, [router?.query?.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCopied) {
      timer = setTimeout(() => setIsCopied.off(), 2000);
    }

    return () => clearTimeout(timer);
  }, [isCopied]);

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
    if (revealSecret.isPasswordProtected) {
      setCurrView(ViewState.isPasswordProtected);
    } else {
      tryDecrypt();
    }
  }, [revealSecret]);

  return (
    <div className="-mt-8 flex h-screen w-screen flex-col items-center justify-center text-gray-200">
      {ViewState.Loading === currView && <p>Loading...</p>}
      {ViewState.Revealed === currView && (
        <div className="w-5/12">
          <div className="mb-1 flex items-center justify-between">
            <FormLabel label="Your secret" />

            <IconButton
              ariaLabel="copy icon"
              colorSchema="secondary"
              className="bg-bunker-800"
              onClick={() => {
                navigator.clipboard.writeText(decryptSecret!);
                setIsCopied.on();
              }}
            >
              <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
            </IconButton>
          </div>
          <TextArea
            rows={8}
            value={decryptSecret!}
            readOnly
            className="bg-bunker-500 ring-0 focus:ring-0"
          />
        </div>
      )}
      {ViewState.isPasswordProtected === currView && (
        <div className="h-6/12 flex w-5/12 flex-col items-center justify-center gap-2 rounded-md bg-bunker-500 py-5 ring-1 ring-bunker-400/60">
          <p className="mb-2 text-2xl">Content is encrypted</p>
          <p className="text-md text-gray-400">Enter password to decrypt!</p>

          <div className="w-60">
            <Input
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <Button size="xs" onClick={() => tryDecrypt()} className="py-2 px-4">
            Submit
          </Button>
        </div>
      )}
      {ViewState.Invalid === currView && (
        <div className="h-6/12 flex w-5/12 flex-col items-center justify-center gap-2 rounded-md bg-bunker-500  py-5 px-12 py-8 ring-1 ring-red-500/60 ">
          <FontAwesomeIcon icon={faExclamationTriangle} size="2xl" />
          <p className="my-4 text-lg text-gray-400">Failed to find/decrypt the secret!</p>
          {revealSecret?.isPasswordProtected && (
            <Button
              onClick={() => {
                setPassword("");
                setCurrView(ViewState.isPasswordProtected);
              }}
            >
              Try again?
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
