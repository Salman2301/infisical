import { z } from "zod";

import { SecretSharingSchema } from "@app/db/schemas";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";

export const registerSecretSharingRouter = async (server: FastifyZodProvider) => {
  server.route({
    url: "/:workspaceId/secret-sharing",
    method: "GET",
    schema: {
      params: z.object({
        workspaceId: z.string()
      }),
      response: {
        200: z.object({ secretSharing: SecretSharingSchema.array() })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const secretSharing = await server.services.secretSharing.listSecretSharing({
        projectId: req.params.workspaceId
      });
      return {
        secretSharing
      };
    }
  });
  server.route({
    url: "/:workspaceId/secret-sharing",
    method: "POST",
    schema: {
      params: z.object({
        workspaceId: z.string()
      }),
      body: z.object({
        secretContent: z.string().trim().min(1, "Secret Content is required field"),
        expireAtValue: z.string().regex(/^\d+$/, "Enter a valid number"),
        expireAtDate: z.string(),
        expireAtUnit: z.enum(["day", "min", "hour"]),
        pathSlug: z.string().trim().min(1, "Path slug is required field"),
        passphrase: z.string().trim().optional(),
        readOnlyOnce: z.boolean().optional()
      }),
      response: {
        200: z.object({ secretSharing: SecretSharingSchema })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const secretSharing = await server.services.secretSharing.createSecretSharing({
        projectId: req.params.workspaceId,
        secretContent: req.body.secretContent,
        expireAtValue: Number(req.body.expireAtValue),
        expireAtDate: new Date(req.body.expireAtDate),
        expireAtUnit: req.body.expireAtUnit,
        pathSlug: req.body.pathSlug,
        passphrase: req.body.passphrase,
        readOnlyOnce: req.body.readOnlyOnce
      });
      return {
        secretSharing
      };
    }
  });

  server.route({
    url: "/:workspaceId/secret-sharing/:secretSharingId",
    method: "DELETE",
    schema: {
      params: z.object({
        workspaceId: z.string(),
        secretSharingId: z.string()
      }),
      response: {
        200: z.object({ secretSharing: SecretSharingSchema })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { secretSharing } = await server.services.secretSharing.deleteSecretSharing(req.params.secretSharingId);

      return { secretSharing };
    }
  });
};
