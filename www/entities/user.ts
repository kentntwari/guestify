type UserRoles = "user" | "admin" | "suspicious" | "banned";
type UserPermissions = "read" | "update" | "overlord";

export class UserEntity {
  private readonly _appName: string;
  private readonly _appRoles: UserRoles = "user";
  private readonly _appPermissions: UserPermissions = "read";

  constructor(app: string = "guestify") {
    this._appName = app;
  }

  get appName() {
    return this._appName;
  }

  get appRoles() {
    return this._appRoles;
  }

  get appPermissions() {
    return this._appPermissions;
  }

  get userRole(): UserRoles {
    return "user";
  }

  get adminRole(): UserRoles {
    return "admin";
  }

  get suspiciousRole(): UserRoles {
    return "suspicious";
  }

  get bannedRole(): UserRoles {
    return "banned";
  }

  get readPermission(): UserPermissions {
    return "read";
  }

  get updatePermission(): UserPermissions {
    return "update";
  }

  get overlordPermission(): UserPermissions {
    return "overlord";
  }

  get newUser() {
    return {
      roles: [`${this.appName}.${this.userRole}`],
      permissions: [
        `${this.appName}.${this.readPermission}`,
        `${this.appName}.${this.updatePermission}`,
      ],
    };
  }
}
