export class UnkeyEntity {
  constructor(
    private id: string,
    private key: string | undefined = undefined,
    protected roles: string[],
    protected permissions: string[]
  ) {}

  
}
