import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import {
  Button,
  FormControl,
  Input,
  Modal,
  ModalClose,
  ModalContent,
  Select,
  SelectItem,
  TextArea
} from "@app/components/v2";

type Props = {
  isOpen?: boolean;
  onToggle: (isOpen: boolean) => void;
};

const createSecretSharing = z.object({
  content: z.string().trim().min(1, "Secret Content is required field"),
  expireAt: z.string().regex(/^\d+$/, "Enter a valid number"),
  expireUnit: z.enum(["day", "min"])
  // Ask for the optional url slug?
  // One time view only
  // passpharse -> bcrypt hash -> encrypt
});

type FormData = z.infer<typeof createSecretSharing>;

export const CreateSecretSharing = ({ isOpen, onToggle }: Props): JSX.Element => {
  const {
    control,
    reset,
    formState: { isSubmitting },
    handleSubmit
  } = useForm<FormData>({
    resolver: zodResolver(createSecretSharing),
    defaultValues: {
      expireAt: "15",
      expireUnit: "min"
    }
  });
  const { createNotification } = useNotificationContext();
  // const { currentWorkspace } = useWorkspace();
  // const workspaceId = currentWorkspace?.id || "";

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen]);

  const onFormSubmit = async ({ content, expireAt }: FormData) => {
    try {
      // Save to database
      // Show a popup or a  screen to copy the sharable URL

      console.log({ content, expireAt });
      // Show a dialog to copy the publish sharable URL?
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
        subTitle="Create a temporary secret to share with public for short time."
      >
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Controller
            control={control}
            name="content"
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Secret Content"
                isError={Boolean(error)}
                errorText={error?.message}
              >
                <TextArea
                  {...field}
                  className="focus:ring-1 focus:ring-primary-400/50 outline-none ring-bunker-400 dark:[color-scheme:dark] hover:ring-bunker-400/60 ring-1"
                />
              </FormControl>
            )}
          />
          <div className="flex gap-4">
            <Controller
              control={control}
              name="expireAt"
              render={({ field, fieldState: { error } }) => (
                <FormControl label="Expire At" isError={Boolean(error)} errorText={error?.message}>
                  <Input {...field} defaultValue={String(field.value)} type="number" />
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="expireUnit"
              render={({ field: { onChange, ...field }, fieldState: { error } }) => (
                <FormControl label="Type" isError={Boolean(error)} errorText={error?.message}>
                  <Select
                    {...field}
                    onValueChange={(val) => onChange(val)}
                    defaultValue={field.value}
                  >
                    <SelectItem value="min">Minutes</SelectItem>
                    <SelectItem value="day">Days</SelectItem>
                  </Select>
                </FormControl>
              )}
            />
          </div>

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
              <Button variant="plain" colorSchema="secondary">
                Cancel
              </Button>
            </ModalClose>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
