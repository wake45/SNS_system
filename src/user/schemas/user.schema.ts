import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema()
export class Profile {
  @Prop()
  name: string;

  @Prop({ default: '안녕하세요.' }) //자기소개
  bio?: string;

  @Prop({ default: '/public/default_profile.png' })
  profile_picture?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

@Schema()
export class User{
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    username: string;

    @Prop({ type: ProfileSchema })
    profile: Profile;
 
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    followers: Types.ObjectId[];
  
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    following: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

UserSchema.pre<UserDocument>('save', function (next) {
    if (!this.profile) {
        this.profile = new Profile();
    }
    if (!this.profile.name) {
        this.profile.name = this.username;
    }
    next();
});