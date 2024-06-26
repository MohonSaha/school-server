import express from 'express'
import { AuthValidation } from './auth.validation'
import validateRequest from '../../middlewares/validateRequest'
import { AuthController } from './auth.controller'
import auth from '../../middlewares/auth'
import { USER_ROLE } from './auth.constant'

const router = express.Router()

router.post(
  '/register',
  validateRequest(AuthValidation.registrationValidationSchema),
  AuthController.registerUser,
)

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
)

router.post(
  '/change-password',
  auth(USER_ROLE.admin, USER_ROLE.user),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
)

export const AuthRoutes = router
