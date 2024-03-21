import { forwardRef, InputHTMLAttributes, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

import { IconButton, Input, Tooltip } from "@app/components/v2";
import { useToggle } from "@app/hooks";

type Props = {
  isError?: boolean;
  isRequired?: boolean;
  urlPrefix?: string;
};

type PathInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & Props;

export const PathInput = forwardRef<HTMLInputElement, PathInputProps>(
  ({ isRequired, isError, urlPrefix, ...props }, ref): JSX.Element => {
    const { t } = useTranslation();

    const [isUrlCopied, setIsUrlCopied] = useToggle(false);

    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (isUrlCopied) {
        timer = setTimeout(() => setIsUrlCopied.off(), 2000);
      }

      return () => clearTimeout(timer);
    }, [isUrlCopied]);

    return (
      <div className="flex justify-between gap-4">
        <div
          className={twMerge(
            "flex w-full rounded-md bg-mineshaft-900 px-2 outline-none ring-1 ring-bunker-400/60 focus-within:ring-1 focus-within:ring-primary-400/50",
            isError && "ring-red/50 focus-within:ring-red/50"
          )}
        >
          <span className="flex items-center text-bunker-400">{urlPrefix || ""}</span>
          <Input
            ref={ref}
            {...props}
            variant="plain"
            className="pl-0 focus:ring-0"
            id="path-slug-input"
          />
        </div>

        <IconButton
          ariaLabel="copy icon"
          colorSchema="secondary"
          className="outline-none focus:ring-1 focus:ring-primary-400/50"
          onClick={() => {
            navigator.clipboard.writeText(`${urlPrefix || ""}${props.value}` ?? "");
            setIsUrlCopied.on();
          }}
        >
          <Tooltip content={t("common.click-to-copy")}>
            <FontAwesomeIcon icon={isUrlCopied ? faCheck : faCopy} />
          </Tooltip>
        </IconButton>
      </div>
    );
  }
);

PathInput.displayName = "PathInput";
