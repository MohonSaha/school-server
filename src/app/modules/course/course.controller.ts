import { CourseServices, getTotalCount } from './course.service'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { Filters } from './course.constant'

const createCourse = catchAsync(async (req, res) => {
  const result = await CourseServices.createCourseIntoDB(req.body, req.user)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Course created successfully',
    data: result,
  })
})

const getAllCourses = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'startDate',
    sortOrder = 'asc',
    ...filters
  } = req.query as Filters

  const skip = (page - 1) * limit

  // data sorting
  const sortField = sortBy === 'duration' ? 'durationInWeeks' : sortBy
  const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 }

  // data filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {}

  if (filters.minPrice) {
    filter.price = { $gte: parseFloat(filters.minPrice) }
  }

  if (filters.maxPrice) {
    filter.price = { $lte: parseFloat(filters.maxPrice) }
  }

  // filtering for price range
  if (filters.minPrice && filters.maxPrice) {
    filter.price = {
      $gte: parseFloat(filters.minPrice),
      $lte: parseFloat(filters.maxPrice),
    }
  }

  // filtering for tags
  if (filters.tags) {
    filter['tags.name'] = filters.tags
  }

  // filtering date range
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate)
    const endDate = new Date(filters.endDate)

    filter.startDate = { $gte: startDate.toISOString() }
    filter.endDate = { $lte: endDate.toISOString() }
  }

  // filtering for language
  if (filters.language) {
    filter.language = filters.language
  }

  // filtering for providers
  if (filters.provider) {
    filter.provider = filters.provider
  }

  // filtering for durationInWeeks
  if (filters.durationInWeeks) {
    filter.durationInWeeks = parseInt(filters.durationInWeeks)
  }

  // filtering for course level
  if (filters.level) {
    filter['details.level'] = filters.level
  }

  const options = { sort, skip, limit: limit }

  // count total query data
  const totalCount = await getTotalCount(filter)
  const result = await CourseServices.getAllCoursesFromDB(filter, options)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Courses retrieved successfully',
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
    },
    data: result,
  })
})

const getCourseWithReview = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await CourseServices.getCourseWithReviewFromDB(id)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Course and Reviews retrieved successfully',
    data: result,
  })
})

const getTheBestCourse = catchAsync(async (req, res) => {
  const result = await CourseServices.getTheBestCourseFromDB()

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Courses retrieved successfully',
    data: result,
  })
})

const updateCourse = catchAsync(async (req, res) => {
  const courseId = req.params.id
  const result = await CourseServices.updateCourseIntoDB(
    courseId,
    req.body,
    // req.user,
  )

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Course updated successfully',
    data: result,
  })
})

export const courseControllers = {
  createCourse,
  getAllCourses,
  getCourseWithReview,
  getTheBestCourse,
  updateCourse,
}
