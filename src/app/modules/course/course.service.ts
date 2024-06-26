import mongoose from 'mongoose'
import { ICourse } from './course.interface'
import { Course } from './course.model'
import AppError from '../../error/appError'
import httpStatus from 'http-status'
import { JwtPayload } from 'jsonwebtoken'

const createCourseIntoDB = async (payload: ICourse, user: JwtPayload) => {
  // const { categoryId } = payload
  payload.createdBy = user.id

  // Check category validation
  // const isCategoryExist = await Category.findById(categoryId)
  // if (!isCategoryExist) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Category does not exist in database',
  //   )
  // }

  const result = await Course.create(payload)
  return result
}

// get total data through specific query
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTotalCount = async (filter: any) => {
  const totalCount = (await Course.find(filter)).length
  return totalCount
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllCoursesFromDB = async (filter: any, options: any) => {
  const result = await Course.find(filter)
    .populate('categoryId')
    .sort(options.sort)
    .skip(options.skip)
    .limit(options.limit)
    .populate({
      path: 'createdBy',
      select: '_id username email role',
    })
  return result
}

const getCourseWithReviewFromDB = async (id: string) => {
  const courseData = await Course.findById(id)
  if (!courseData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found in database')
  }
  const course = courseData.populate({
    path: 'createdBy',
    select: '_id username email role',
  })

  // const reviews = await Review.find({ courseId: id })
  // const result = { course, reviews }
  const result = { course }
  return result
}

const getTheBestCourseFromDB = async () => {
  const result = await Course.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'courseId',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        reviewCount: { $size: '$reviews' },
        averageRating: { $avg: '$reviews.rating' },
      },
    },
    {
      $sort: { averageRating: -1, reviewCount: -1 },
    },
    {
      $limit: 1,
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    {
      $unwind: {
        path: '$createdBy',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        course: {
          _id: '$_id',
          title: '$title',
          instructor: '$instructor',
          categoryId: '$categoryId',
          price: '$price',
          tags: '$tags',
          startDate: '$startDate',
          endDate: '$endDate',
          language: '$language',
          provider: '$provider',
          durationInWeeks: '$durationInWeeks',
          details: '$details',
          createdBy: {
            _id: '$createdBy._id',
            username: '$createdBy.username',
            email: '$createdBy.email',
            role: '$createdBy.role',
          },
        },
        _id: 0,
        averageRating: 1,
        reviewCount: 1,
      },
    },
  ])

  return result
}

const updateCourseIntoDB = async (
  id: string,
  payload: Partial<ICourse>,
  // user: JwtPayload,
) => {
  const {
    details,
    tags,
    startDate,
    endDate,
    durationInWeeks,
    ...restCourseData
  } = payload

  // payload.createdBy = user.id

  const modifiedUpdatedData: Record<string, unknown> = {
    ...restCourseData,
  }

  if (details && Object.keys(details).length) {
    for (const [key, value] of Object.entries(details)) {
      modifiedUpdatedData[`details.${key}`] = value
    }
  }

  // Through error for durationInWeeks filed
  if (durationInWeeks) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'durationInWeeks is not updateable',
    )
  }

  // update duration
  const existingCourse = await Course.findById(id)
  if (existingCourse) {
    const newStartDate = startDate || existingCourse.startDate
    const newEndDate = endDate || existingCourse.endDate

    if (startDate || endDate || (startDate && endDate)) {
      const start = new Date(newStartDate)
      const end = new Date(newEndDate)

      // Calculate the difference in weeks and rounded up
      const diffInMilliseconds = Math.abs(end.getTime() - start.getTime())
      const diffInWeeks = Math.ceil(
        diffInMilliseconds / (7 * 24 * 60 * 60 * 1000),
      )
      modifiedUpdatedData.durationInWeeks = diffInWeeks
      modifiedUpdatedData.startDate = newStartDate
      modifiedUpdatedData.endDate = newEndDate
    }
  }

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // update primitive and non-primitive data
    const updateCOurseData = await Course.findByIdAndUpdate(
      id,
      modifiedUpdatedData,
      {
        new: true,
        runValidators: true,
        session,
      },
    )

    if (!updateCOurseData) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course !!')
    }

    // check that there is any tags for the update
    if (tags && tags.length > 0) {
      // filter deleted tags data
      const getDeletedTags = tags
        .filter((el) => el.name && el.isDeleted)
        .map((el) => el.name)

      const deleteTags = await Course.findByIdAndUpdate(
        id,
        {
          $pull: { tags: { name: { $in: getDeletedTags } } },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      )

      if (!deleteTags) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course !!')
      }

      // filter added tags data
      const getNewTags = tags?.filter((el) => el.name && !el.isDeleted)

      const addedTags = await Course.findByIdAndUpdate(
        id,
        {
          $addToSet: { tags: { $each: getNewTags } },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      )

      if (!addedTags) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course !!')
      }
    }

    await session.commitTransaction()
    await session.endSession()

    const result = await Course.findById(id).populate('tags.name').populate({
      path: 'createdBy',
      select: '_id username email role',
    })
    return result
  } catch (err) {
    await session.abortTransaction()
    await session.endSession()
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course!!')
  }
}

export const CourseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
  getCourseWithReviewFromDB,
  getTheBestCourseFromDB,
  updateCourseIntoDB,
}
