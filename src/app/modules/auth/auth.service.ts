import httpStatus from 'http-status'
import AppError from '../../error/appError'
import { ILoginUser, IPasswordHistory, IUser } from './auth.interface'
import { User } from './auth.model'
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from '../../config'
import bcrypt from 'bcrypt'
import { format } from 'date-fns'

const registerUserIntoDB = async (payload: IUser) => {
  const result = await User.create(payload)
  return result
}

const loginUser = async (payload: ILoginUser) => {
  // Check if the user is exist
  const user = await User.isUserExistByUserName(payload?.username)
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found')
  }

  // Check if the password is matched
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched')
  }

  // Access is granted ==> Create access token and Send to the user

  // Create jwt payload
  const jwtPayload = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: (user as any)._id,
    role: user.role,
    email: user.email,
  }

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10d',
  })

  // Exclude the password field from the result object
  const modifiedResult = JSON.parse(JSON.stringify(user))
  delete modifiedResult.password

  return {
    user: modifiedResult,
    token: accessToken,
  }
}

// Change the password
const changePassword = async (
  userData: JwtPayload,
  payload: {
    currentPassword: string
    newPassword: string
  },
) => {
  // Check if the user is exist
  const user = await User.isUserExistById(userData?.id)
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found')
  }

  // Check if the password is matched
  if (
    !(await User.isPasswordMatched(payload?.currentPassword, user?.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched')
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_round),
  )

  //   Check if the new password is the same as the current one
  if (await User.isPasswordMatched(payload?.newPassword, user?.password)) {
    const formattedTime = format(
      new Date(user?.passwordChangeAt as Date),
      "'(last used on' yyyy-MM-dd 'at' hh:mm a)",
    )

    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Password change failed. Ensure the new password is unique and not among the last 2 used ${formattedTime}.`,
    )
  }

  // Check if the given password is in the last two password hsitory
  const passwordHistory = user?.passwordChangeHistory as IPasswordHistory[]

  const matchResults = await Promise.all(
    passwordHistory?.map(async (history) => {
      const isMatch = await bcrypt.compare(
        payload.newPassword,
        history.password,
      )
      return { isMatch, history }
    }),
  )

  const indexOfMatch = matchResults.findIndex((result) => result.isMatch)

  if (indexOfMatch !== -1) {
    const matchingHistory = matchResults[indexOfMatch].history

    const formattedTime = format(
      new Date(matchingHistory?.time),
      "'(last used on' yyyy-MM-dd 'at' hh:mm a)",
    )

    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Password change failed. Ensure the new password is unique and not among the last 2 used ${formattedTime}.`,
    )
  }

  // Update password and passwordChangeHistory
  await User.findOneAndUpdate(
    {
      _id: userData.id,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangeAt: new Date(),
      $push: {
        passwordChangeHistory: {
          $each: [{ password: user?.password, time: new Date() }],
          $position: 0,
          $slice: 2,
        },
      },
    },
    { new: true },
  )

  return user
}

export const AuthService = {
  registerUserIntoDB,
  loginUser,
  changePassword,
}
