import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@app/components/v2";
import { usePopUp } from "@app/hooks";

import { CreateSecretSharing } from "./CreateSecretSharing";

export const HeaderSecretSharing = () => {
  const { popUp, handlePopUpToggle, handlePopUpOpen } = usePopUp(["secretSharing"] as const);

  return (
    <div className="flex justify-end">
      <Button
        onClick={() => handlePopUpOpen("secretSharing")}
        size="xs"
        className="mt-2 py-2"
        leftIcon={<FontAwesomeIcon icon={faPlus} className="mx-1" />}
      >
        Create new one-time secret
      </Button>

      <CreateSecretSharing
        isOpen={popUp.secretSharing.isOpen}
        onToggle={(isOpen) => handlePopUpToggle("secretSharing", isOpen)}
      />
    </div>
  );
};
