import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { AuthService } from './auth.service'

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthService.registerUserIntoDB(req.body)
  const modifiedResult = JSON.parse(JSON.stringify(result))
  delete modifiedResult.password
  delete modifiedResult.passwordChangeHistory
  delete modifiedResult.passwordChangeAt

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: modifiedResult,
  })
})

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body)
  const modifiedResult = JSON.parse(JSON.stringify(result))
  if (modifiedResult.user) {
    delete modifiedResult.user.password
    delete modifiedResult.user.passwordChangeHistory
    delete modifiedResult.user.passwordChangeAt
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User login successful',
    data: modifiedResult,
  })
})

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body

  const result = await AuthService.changePassword(req.user, passwordData)

  const modifiedResult = JSON.parse(JSON.stringify(result))
  delete modifiedResult.password
  delete modifiedResult.passwordChangeHistory
  delete modifiedResult.passwordChangeAt

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: modifiedResult,
  })
})

export const AuthController = {
  registerUser,
  loginUser,
  changePassword,
}
