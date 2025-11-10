export class UnkeyEntity {
  constructor(
    public id: string,
    public key: string | undefined = undefined,
    public roles: string[],
    public permissions: string[]
  ) {}
}
