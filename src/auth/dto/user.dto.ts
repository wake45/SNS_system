import { IsString, IsEmail, MinLength } from 'class-validator';

export class UserDTO {
    @IsEmail()
    readonly email: string;

    @IsString()
    @MinLength(6)
    readonly password: string;

    @IsString()
    readonly name: string;
}
