/* eslint-disable no-unused-vars */
import { Model } from 'mongoose'
import { USER_ROLE } from './auth.constant'

export interface IPasswordHistory {
  password: string
  time: Date
}

export interface IUser {
  username: string
  email: string
  password: string
  passwordChangeAt?: Date
  passwordChangeHistory?: [IPasswordHistory]
  role: 'user' | 'admin'
}

export interface ILoginUser {
  username: string
  password: string
}

export type TUserRole = keyof typeof USER_ROLE

export interface UserModel extends Model<IUser> {
  isUserExistByUserName(name: string): Promise<IUser>
  isUserExistById(id: string): Promise<IUser>

  isPasswordMatched(
    // eslint-disable-next-line no-unused-vars
    plainTextPassword: string,
    // eslint-disable-next-line no-unused-vars
    hashPassword: string,
  ): Promise<boolean>
}
