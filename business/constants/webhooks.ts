export const organization = {
  created: "organization.created",
  updated: "organization.updated",
  deleted: "organization.deleted",
} as const;

export const user = {
  created: "user.created",
  updated: "user.updated",
  deleted: "user.deleted",
  auth_success: "user.authenticated",
  auth_failed: "user.authentication_failed",
} as const;

export const role = {
  created: "role.created",
  updated: "role.updated",
  deleted: "role.deleted",
} as const;

export const permission = {
  created: "permission.created",
  updated: "permission.updated",
  deleted: "permission.deleted",
} as const;
