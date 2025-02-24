import { z } from "zod";

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type TUserSchema = z.infer<typeof userSchema>;

export class User {
  private _id: string;
  private _email: string;
  private _first_name: string;
  private _last_name: string;

  constructor({ id, email, firstName, lastName }: TUserSchema) {
    this._id = id;
    this._email = email;
    this._first_name = firstName;
    this._last_name = lastName;
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get firstName(): string {
    return this._first_name;
  }

  get lastName(): string {
    return this._last_name;
  }

  get fullName(): string {
    return `${this._first_name} ${this._last_name}`;
  }
}
