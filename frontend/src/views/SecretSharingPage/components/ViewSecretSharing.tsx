import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { FormLabel, TextArea } from "@app/components/v2";
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
    if (revealSecret) setCurrView(ViewState.Revealed);
  }, [revealSecret]);

  return (
    <div className="-mt-8 flex h-screen w-screen flex-col items-center justify-center text-gray-200">
      {ViewState.Loading === currView && <p>Loading...</p>}
      {ViewState.Revealed === currView && (
        <div className="w-[480px]">
          <FormLabel label="Your secret" />
          <TextArea rows={8} value={revealSecret!} readOnly className="ring-1" />
        </div>
      )}
      {ViewState.Invalid === currView && (
        <div>
          <p className="my-4 text-xl">Failed to find the secret!</p>
        </div>
      )}
    </div>
  );
};
