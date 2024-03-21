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
  SelectItem
} from "@app/components/v2";
import { useWorkspace } from "@app/context";
import { useUpdateWsSecretSharing } from "@app/hooks/api";
import { TSecretSharingRes } from "@app/hooks/api/secretSharing/types";

type Props = {
  isOpen?: boolean;
  onToggle: (isOpen: boolean) => void;
  secretSharing: TSecretSharingRes;
};

const updateSecretSharingSchema = z.object({
  expireAtValue: z.string().regex(/^\d+$/, "Enter a valid number"),
  expireAtUnit: z.enum(["day", "min", "hour"])
});

type FormData = z.infer<typeof updateSecretSharingSchema>;

export const UpdateSecretSharing = ({ isOpen, onToggle, secretSharing }: Props): JSX.Element => {
  const {
    control,
    reset,
    formState: { isSubmitting },
    handleSubmit
  } = useForm<FormData>({
    resolver: zodResolver(updateSecretSharingSchema),
    defaultValues: {
      expireAtValue: "15",
      expireAtUnit: "min"
    }
  });
  const { createNotification } = useNotificationContext();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || "";

  const { mutateAsync: updateSecretSharing } = useUpdateWsSecretSharing({
    workspaceId,
    secretSharingId: secretSharing?.id
  });

  const onFormSubmit = async ({ expireAtValue, expireAtUnit }: FormData) => {
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
      await updateSecretSharing({
        expireAtDate,
        expireAtValue,
        expireAtUnit
      });

      onToggle(false);
      reset();
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to extend secret duration",
        type: "error"
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onToggle}>
      <ModalContent
        title="Extend duration"
        subTitle={`Extend the current duration time for the secret (${secretSharing?.pathSlug}).`}
        className="overflow-auto"
      >
        <form onSubmit={handleSubmit(onFormSubmit)}>
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

          <div className="mt-8 flex items-center">
            <Button
              className="mr-4"
              type="submit"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Extend
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
