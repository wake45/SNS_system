import { Types } from "mongoose";

export class ProfileDto {
  constructor(
    public name?: string,
    public bio?: string,
    public profile_picture?: string,
  ) {}
}
  
export class UserResponseDto {
  constructor(
    public email: string,
    public username: string,
    public profile: ProfileDto,
    public followers: any[] = [],
    public following: any[] = [],
    public _id: Types.ObjectId,
  ) {}
}

  