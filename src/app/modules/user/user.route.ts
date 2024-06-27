import express from 'express'
import { userControllers } from './user.controller'
// import auth from '../../middlewares/auth'
// import { USER_ROLE } from './user.constant'

const router = express.Router()

// Route will call controller function
// router.post(
//   '/create-student',
//   auth(USER_ROLE.admin, USER_ROLE.superAdmin),
//   upload.single('file'), // parse file through malter
//   (req: Request, res: Response, next: NextFunction) => {
//     // inject parse data in req.body through middleware
//     req.body = JSON.parse(req.body.data)
//     next()
//   },
//   validateRequest(studentValidations.createStudentValidationSchema),
//   userControllers.createStudent,
// )

// router.post(
//   '/create-faculty',
//   auth(USER_ROLE.admin, USER_ROLE.superAdmin),
//   validateRequest(createFacultyValidationSchema),
//   userControllers.createAcademicFaculty,
// )

router.post(
  '/create-admin',
  //   auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  //   validateRequest(createAdminValidationSchema),
  userControllers.createAdmin,
)

// router.get(
//   '/me',
//   auth(
//     USER_ROLE.admin,
//     USER_ROLE.faculty,
//     USER_ROLE.student,
//     USER_ROLE.superAdmin,
//   ),
//   userControllers.getMe,
// )

// router.post(
//   '/change-status/:id',
//   auth(USER_ROLE.admin, USER_ROLE.superAdmin),
//   validateRequest(UserVAlidation.changeStatusValidationSchema),
//   userControllers.chnageStatus,
// )

export const UserRoutes = router
