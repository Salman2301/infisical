import { z } from "zod";

import { SecretSharingSchema } from "@app/db/schemas";
import { BadRequestError } from "@app/lib/errors";
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
        readOnlyOnce: z.boolean().optional(),
        isPasswordProtected: z.boolean(),
        iv: z.string().trim()
      }),
      response: {
        200: z.object({ secretSharing: SecretSharingSchema })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const isPathTaken = await server.services.secretSharing.isPathTaken(req.body.pathSlug);

      if (isPathTaken) {
        throw new BadRequestError({
          message: `Path (/${req.body.pathSlug}) already taken`
        });
      }

      const secretSharing = await server.services.secretSharing.createSecretSharing({
        projectId: req.params.workspaceId,
        secretContent: req.body.secretContent,
        expireAtValue: Number(req.body.expireAtValue),
        expireAtDate: new Date(req.body.expireAtDate),
        expireAtUnit: req.body.expireAtUnit,
        pathSlug: req.body.pathSlug,
        isPasswordProtected: req.body.isPasswordProtected,
        readOnlyOnce: req.body.readOnlyOnce,
        iv: req.body.iv
      });
      return {
        secretSharing
      };
    }
  });
  server.route({
    url: "/:workspaceId/secret-sharing/:secretSharingId",
    method: "PUT",
    schema: {
      params: z.object({
        workspaceId: z.string(),
        secretSharingId: z.string()
      }),
      body: z.object({
        expireAtValue: z.string().regex(/^\d+$/, "Enter a valid number"),
        expireAtDate: z.string(),
        expireAtUnit: z.enum(["day", "min", "hour"])
      }),
      response: {
        200: z.object({ secretSharing: SecretSharingSchema })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const secretSharing = await server.services.secretSharing.updateSecretSharing({
        id: req.params.secretSharingId,
        projectId: req.params.workspaceId,
        expireAtValue: Number(req.body.expireAtValue),
        expireAtDate: new Date(req.body.expireAtDate),
        expireAtUnit: req.body.expireAtUnit
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

export const registerSecretSharingPublicRouter = async (server: FastifyZodProvider) => {
  server.route({
    url: "/valid/:slug",
    method: "GET",
    schema: {
      params: z.object({
        slug: z.string()
      }),
      response: {
        200: z.boolean()
      }
    },
    handler: async (req) => {
      const isValid = await server.services.secretSharing.validSecretSharing({
        pathSlug: req.params.slug
      });
      return isValid;
    }
  });

  server.route({
    url: "/reveal/:slug",
    method: "GET",
    schema: {
      params: z.object({
        slug: z.string()
      }),
      response: {
        200: z.object({
          cipher: z.string(),
          iv: z.string(),
          isPasswordProtected: z.boolean()
        })
      }
    },
    handler: async (req) => {
      const secret = await server.services.secretSharing.revealSecretSharing({
        pathSlug: req.params.slug
      });
      return secret;
    }
  });
};
