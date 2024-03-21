import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import {
  Button,
  Checkbox,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalContent,
  Select,
  SelectItem,
  TextArea
} from "@app/components/v2";
import { useWorkspace } from "@app/context";
import { encrypt } from "@app/helpers/secretSharing";
import { randomSlug } from "@app/helpers/slug";
import { useToggle } from "@app/hooks";
import { useCreateWsSecretSharing } from "@app/hooks/api";

type Props = {
  isOpen?: boolean;
  onToggle: (isOpen: boolean) => void;
};

const createSecretSharing = z.object({
  secretContent: z.string({ required_error: "Secret Content is required field" }).trim().min(1),
  expireAtValue: z.string().regex(/^\d+$/, "Enter a valid number"),
  expireAtUnit: z.enum(["day", "min", "hour"]),
  pathSlug: z.string().trim().min(1, "Path slug is required field"),
  passphrase: z.string().trim().optional(),
  readOnlyOnce: z.boolean().optional()
});

type FormData = z.infer<typeof createSecretSharing>;

export const CreateSecretSharing = ({ isOpen, onToggle }: Props): JSX.Element => {
  const {
    control,
    reset,
    setValue,
    formState: { isSubmitting },
    handleSubmit
  } = useForm<FormData>({
    resolver: zodResolver(createSecretSharing),
    defaultValues: {
      expireAtValue: "15",
      expireAtUnit: "min",
      pathSlug: randomSlug(),
      readOnlyOnce: false
    }
  });
  const { t } = useTranslation();
  const { createNotification } = useNotificationContext();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || "";

  const { mutateAsync: createServiceSharing } = useCreateWsSecretSharing({ workspaceId });
  const [isUrlCopied, setIsUrlCopied] = useToggle(false);

  useEffect(() => {
    setValue("pathSlug", randomSlug());
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUrlCopied) {
      timer = setTimeout(() => setIsUrlCopied.off(), 2000);
    }

    return () => clearTimeout(timer);
  }, [isUrlCopied]);

  const onFormSubmit = async ({
    secretContent,
    expireAtValue,
    expireAtUnit,
    pathSlug,
    readOnlyOnce
  }: FormData) => {
    try {
      const expireAtDate = new Date();

      const expireAtNum = Number.isNaN(Number(expireAtValue)) ? 0 : Number(expireAtValue);

      switch (expireAtUnit) {
        case "day":
          expireAtDate.setDate(expireAtDate.getDate() + expireAtNum);
          break;
        case "hour":
          expireAtDate.setHours(expireAtDate.getHours() + expireAtNum);
          break;
        case "min":
          expireAtDate.setMinutes(expireAtDate.getMinutes() + expireAtNum);
          break;
        default:
          throw new Error("Invalid expire unit");
      }

      const { cipher, iv } = await encrypt(secretContent);
      await createServiceSharing({
        projectId: workspaceId,
        expireAtDate,
        expireAtValue,
        expireAtUnit,
        pathSlug,
        readOnlyOnce: !!readOnlyOnce,
        secretContent: cipher,
        iv
      });

      // Show a dialog to copy expireAtDate publish sharable URL?
      onToggle(false);
      reset();
      createNotification({
        text: "Successfully created secret sharing",
        type: "success"
      });
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to create secret sharing",
        type: "error"
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onToggle}>
      <ModalContent
        title="Create secret sharing"
        subTitle="Create an one-time secret to share with public for short-time."
        className="overflow-auto"
      >
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Controller
            control={control}
            name="secretContent"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Secret Content"
                isError={Boolean(error)}
                errorText={error?.message}
              >
                <TextArea
                  {...field}
                  className="max-w-full border-0 bg-mineshaft-900 outline-none ring-1 ring-bunker-400 ring-bunker-400/60 hover:ring-bunker-400/60 focus:ring-1 focus:ring-primary-400/50 dark:[color-scheme:dark]"
                />
              </FormControl>
            )}
          />
          <div className="flex gap-4">
            <Controller
              control={control}
              name="expireAtValue"
              render={({ field, fieldState: { error } }) => (
                <FormControl label="Expire At" isError={Boolean(error)} errorText={error?.message}>
                  <Input {...field} type="number" className="ring-1 ring-bunker-400/60" />
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="expireAtUnit"
              render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                <FormControl label="Type" isError={Boolean(error)} errorText={error?.message}>
                  <Select
                    {...field}
                    onValueChange={(val) => onChange(val)}
                    defaultValue={field.value}
                    className="min-w-10 bg-mineshaft-900 ring-1 ring-bunker-400/60 focus:ring-primary-400/50"
                  >
                    <SelectItem value="min">Minutes</SelectItem>
                    <SelectItem value="hour">Hours</SelectItem>
                    <SelectItem value="day">Days</SelectItem>
                  </Select>
                </FormControl>
              )}
            />
          </div>
          <Controller
            control={control}
            name="pathSlug"
            render={({ field, fieldState: { error } }) => (
              <FormControl label="Path Slug" isError={Boolean(error)} errorText={error?.message}>
                <div className="flex justify-between gap-4">
                  <div
                    className={twMerge(
                      "flex w-full rounded-md bg-mineshaft-900 px-2 outline-none ring-1 ring-bunker-400/60 focus-within:ring-1 focus-within:ring-primary-400/50",
                      Boolean(error) && "ring-red/50 focus-within:ring-red/50"
                    )}
                  >
                    <span className="flex items-center text-bunker-400">
                      {window.location.origin}/l/
                    </span>
                    <Input
                      {...field}
                      variant="plain"
                      className="pl-0 focus:ring-0"
                      id="path-slug-input"
                    />
                  </div>

                  <IconButton
                    ariaLabel="copy icon"
                    colorSchema="secondary"
                    className="group relative"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/l/${field.value}` ?? ""
                      );
                      setIsUrlCopied.on();
                    }}
                  >
                    <FontAwesomeIcon icon={isUrlCopied ? faCheck : faCopy} />
                    <span className="absolute -left-8 -top-20 hidden w-28 translate-y-full rounded-md bg-bunker-800 py-2 pl-3 text-center text-sm text-gray-400 group-hover:flex group-hover:animate-fadeIn">
                      {t("common.click-to-copy")}
                    </span>
                  </IconButton>
                </div>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="readOnlyOnce"
            render={({ field, fieldState: { error } }) => (
              <FormControl isError={Boolean(error)} errorText={error?.message}>
                <Checkbox
                  id="read-only-once"
                  isChecked={field.value}
                  onCheckedChange={field.onChange}
                >
                  Delete content immediately after read!
                </Checkbox>
              </FormControl>
            )}
          />

          <div className="mt-8 flex items-center">
            <Button
              className="mr-4"
              type="submit"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Create
            </Button>
            <ModalClose asChild>
              <Button
                variant="plain"
                colorSchema="secondary"
                className="border border-white px-4 py-2"
              >
                Cancel
              </Button>
            </ModalClose>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
