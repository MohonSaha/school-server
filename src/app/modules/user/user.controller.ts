// import { RequestHandler } from 'express'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { UserServices } from './user.service'

// // Create studnet account
// const createStudent: RequestHandler = catchAsync(async (req, res) => {
//   // console.log(req.file, 'file')
//   const { password, student: payLoad } = req.body

//   const result = await UserServices.createStudentIntoDB(
//     req.file,
//     password,
//     payLoad,
//   )

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Student created successfully',
//     data: result,
//   })
// })

// Create faculty account
// const createAcademicFaculty: RequestHandler = catchAsync(async (req, res) => {
//   const { password, faculty: payLoad } = req.body

//   const result = await UserServices.createFacultyIntoDB(password, payLoad)

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Academic faculty is created successfully',
//     data: result,
//   })
// })

// Create admin account
const createAdmin = catchAsync(async (req, res) => {
  const { password, admin: adminData } = req.body

  const result = await UserServices.createAdminIntoDB(password, adminData)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is created succesfully',
    data: result,
  })
})

// Create get me route
// const getMe = catchAsync(async (req, res) => {
//   const { userId, role } = req.user
//   const result = await UserServices.getMe(userId, role)

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User is retrived succesfully',
//     data: result,
//   })
// })

// change status
const chnageStatus = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await UserServices.chnageStatus(id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status is updated succesfully',
    data: result,
  })
})

export const userControllers = {
  //   createStudent,
  //   createAcademicFaculty,
  createAdmin,
  //   getMe,
  chnageStatus,
}
