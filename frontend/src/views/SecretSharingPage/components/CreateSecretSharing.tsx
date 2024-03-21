import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { z } from "zod";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import {
  Button,
  Checkbox,
  FormControl,
  Input,
  Modal,
  ModalClose,
  ModalContent,
  PathInput,
  Select,
  SelectItem,
  TextArea
} from "@app/components/v2";
import { useWorkspace } from "@app/context";
import { encrypt } from "@app/helpers/secretSharing";
import { randomSlug } from "@app/helpers/slug";
import { useCreateWsSecretSharing } from "@app/hooks/api";

type Props = {
  isOpen?: boolean;
  onToggle: (isOpen: boolean) => void;
};

const createSecretSharingSchema = z.object({
  secretContent: z.string({ required_error: "Secret Content is required field" }).trim().min(1),
  expireAtValue: z.string().regex(/^\d+$/, "Enter a valid number"),
  expireAtUnit: z.enum(["day", "min", "hour"]),
  pathSlug: z.string().trim().min(1, "Path slug is required field").regex(/^[a-zA-Z0-9-]+$/g, "Alpha-numerical and hyphens only allowed"),
  readOnlyOnce: z.boolean().optional(),
  password: z.string().optional(), // We are not sending this data to server
  isPasswordProtected: z.boolean().optional()
});

type FormData = z.infer<typeof createSecretSharingSchema>;

export const CreateSecretSharing = ({ isOpen, onToggle }: Props): JSX.Element => {
  const {
    control,
    reset,
    setValue,
    formState: { isSubmitting },
    handleSubmit
  } = useForm<FormData>({
    resolver: zodResolver(createSecretSharingSchema),
    defaultValues: {
      expireAtValue: "15",
      expireAtUnit: "min",
      pathSlug: randomSlug(),
      readOnlyOnce: false
    }
  });
  const { createNotification } = useNotificationContext();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || "";

  const { mutateAsync: createSecretSharing } = useCreateWsSecretSharing({ workspaceId });

  useEffect(() => {
    setValue("pathSlug", randomSlug());
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  const onFormSubmit = async ({
    secretContent,
    expireAtValue,
    expireAtUnit,
    pathSlug,
    readOnlyOnce,
    password
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
      const { cipher, iv } = await encrypt(secretContent, password);
      await createSecretSharing({
        projectId: workspaceId,
        expireAtDate,
        expireAtValue,
        expireAtUnit,
        pathSlug,
        readOnlyOnce: !!readOnlyOnce,
        secretContent: cipher,
        iv,
        isPasswordProtected: !!password
      });

      onToggle(false);
      reset();
      createNotification({
        text: "Successfully created one-time secret",
        type: "success"
      });
    } catch (error) {
      console.error(error);

      let errorMessage: string = "Failed to create one-time secret!";
      if (axios.isAxiosError(error)) {
        const { message } = error?.response?.data as { message: string };
        if(message) errorMessage = message;
      }

      createNotification({
        text: errorMessage,
        type: "error"
      });

    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onToggle}>
      <ModalContent
        title="Create one-time secret"
        subTitle="Create a one-time secret to share publicly for a short period."
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
                <PathInput {...field} urlPrefix={`${window.location.origin}/l/`} />
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Password (optional)"
                isError={Boolean(error)}
                errorText={error?.message}
              >
                <Input
                  {...field}
                  type="password"
                  className="ring-1 ring-bunker-400/60"
                />
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
                  Delete after first read?
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
