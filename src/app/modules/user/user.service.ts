import mongoose from 'mongoose'
import config from '../../config'
import { TAdmin } from '../admin/admin.interface'
import { TUser } from './user.interface'
import { generateAdminId } from './user.utils'
import { User } from './user.model'
import AppError from '../../error/appError'
import httpStatus from 'http-status'
import { Admin } from '../admin/admin.model'

// admin creation
const createAdminIntoDB = async (password: string, payload: TAdmin) => {
  // create a user object
  const userData: Partial<TUser> = {}

  //if password is not given , use deafult password
  userData.password = password || (config.default_password as string)

  //set admin role
  userData.role = 'admin'
  // set admin email
  userData.email = payload.email

  const session = await mongoose.startSession()

  try {
    session.startTransaction()
    //set  generated id
    userData.id = await generateAdminId()

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session })

    //create a admin
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin')
    }
    // set id , _id as user
    payload.id = newUser[0].id
    payload.user = newUser[0]._id //reference _id

    // create a admin (transaction-2)
    const newAdmin = await Admin.create([payload], { session })

    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin')
    }

    await session.commitTransaction()
    await session.endSession()

    return newAdmin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    await session.abortTransaction()
    await session.endSession()
    throw new Error(err)
  }
}

// // Get user data accouding to role
// const getMe = async (userId: string, role: string) => {
//   let result = null
//   if (role === 'student') {
//     result = await Student.findOne({ id: userId }).populate('user')
//   }
//   if (role === 'admin') {
//     result = await Admin.findOne({ id: userId }).populate('user')
//   }
//   if (role === 'faculty') {
//     result = await Faculty.findOne({ id: userId }).populate('user')
//   }
//   return result
// }

// cahnege status data
const chnageStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true })
  return result
}

export const UserServices = {
  //   createStudentIntoDB,
  //   createFacultyIntoDB,
  createAdminIntoDB,
  //   getMe,
  chnageStatus,
}
