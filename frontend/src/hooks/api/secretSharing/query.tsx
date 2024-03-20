import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { TSecretSharing, TSecretSharingRes } from "./types";

const secretSharingKeys = {
  getSecretSharingWorkspace: (workspaceId: string) => [{ workspaceId }, "secret-sharing"] as const
};

const fetchWorkspaceSecretSharing = async (workspaceId: string) => {
  const { data } = await apiRequest.get<{ secretSharing: TSecretSharingRes[] }>(
    `/api/v1/workspace/${workspaceId}/secret-sharing`
  );
  return data;
};

type UseGetWorkspaceSecretSharingProps = { workspaceId: string };

export const useGetWsSecretSharing = ({ workspaceId }: UseGetWorkspaceSecretSharingProps) => {
  return useQuery({
    queryKey: secretSharingKeys.getSecretSharingWorkspace(workspaceId),
    queryFn: () => fetchWorkspaceSecretSharing(workspaceId),
    enabled: true
  });
};

// mutation
export const useCreateWsSecretSharing = ({ workspaceId }: UseGetWorkspaceSecretSharingProps) => {
  const queryClient = useQueryClient();

  return useMutation<TSecretSharingRes, {}, TSecretSharing>({
    mutationFn: async (body) => {
      const { data } = await apiRequest.post(
        `/api/v1/workspace/${workspaceId}/secret-sharing/`,
        body
      );

      return data?.secretSharing;
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries(secretSharingKeys.getSecretSharingWorkspace(projectId));
    }
  });
};

export const useDeleteWsSecretSharing = ({ workspaceId }: UseGetWorkspaceSecretSharingProps) => {
  const queryClient = useQueryClient();

  return useMutation<TSecretSharingRes, {}, string>({
    mutationFn: async (secretSharingId) => {
      const { data } = await apiRequest.delete(
        `/api/v1/workspace/${workspaceId}/secret-sharing/${secretSharingId}`
      );
      return data?.secretSharing;
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries(secretSharingKeys.getSecretSharingWorkspace(projectId));
    }
  });
};
