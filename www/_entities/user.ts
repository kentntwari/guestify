import {
  type TAppUserRoles,
  type TAppUserPermissions,
  type TAppUserPlan,
} from "utils/schemas.zod";

export class UserEntity {
  static readonly appName: string = "guestify";
  static readonly defaultRole: TAppUserRoles = "user";
  static readonly defaultPlan: TAppUserPlan = "free";
  static readonly adminRole: TAppUserRoles = "admin";
  static readonly bannedRole: TAppUserRoles = "banned";
  static readonly suspiciousRole: TAppUserRoles = "suspicious";
  static readonly defaultPermission: TAppUserPermissions = "read";
  static readonly updatePermission: TAppUserPermissions = "update";
  static readonly overlordPermission: TAppUserPermissions = "overlord";

  constructor(
    public id: string,
    public firstName: string,
    public lastName: string,
    public emailAddress: string,
    public imageUrl: string
  ) {}

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  static newUser() {
    return {
      roles: [`${UserEntity.appName}.${UserEntity.defaultRole}`],
      permissions: [
        `${UserEntity.appName}.${UserEntity.defaultPermission}`,
        `${UserEntity.appName}.${UserEntity.updatePermission}`,
      ],
    };
  }

  static defaultPreferences() {}
}
