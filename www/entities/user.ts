type UserRoles = "user" | "admin" | "suspicious" | "banned";
type UserPermissions = "read" | "update" | "overlord";

export class UserEntity {
  static readonly appName: string = "guestify";
  static readonly defaultRole: UserRoles = "user";
  static readonly adminRole: UserRoles = "admin";
  static readonly bannedRole: UserRoles = "banned";
  static readonly suspiciousRole: UserRoles = "suspicious";
  static readonly defaultPermission: UserPermissions = "read";
  static readonly updatePermission: UserPermissions = "update";
  static readonly overlordPermission: UserPermissions = "overlord";

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
}
