import { Schema, model } from 'mongoose'
import { ICourse, IDetails, ITags } from './course.interface'
import AppError from '../../error/appError'
import httpStatus from 'http-status'

const tagsSchema = new Schema<ITags>(
  {
    name: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
)

const detailsSchema = new Schema<IDetails>({
  level: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      unique: true,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    tags: [tagsSchema],
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    durationInWeeks: {
      type: Number,
    },
    details: detailsSchema,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  },
)

courseSchema.pre('save', function (next) {
  const start = new Date(this.startDate)
  const end = new Date(this.endDate)

  // Calculate the difference in weeks and rounded up
  const diffInMilliseconds = Math.abs(end.getTime() - start.getTime())
  const diffInWeeks = Math.ceil(diffInMilliseconds / (7 * 24 * 60 * 60 * 1000))
  this.durationInWeeks = diffInWeeks
  next()
})

// Validation for duplicate course name
courseSchema.pre('save', async function (next) {
  const isCourseExist = await Course.findOne({
    title: this.title,
  })
  if (isCourseExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'This Course is already exist')
  }
  next()
})

export const Course = model<ICourse>('Course', courseSchema)
