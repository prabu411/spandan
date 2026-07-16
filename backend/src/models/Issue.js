import mongoose from 'mongoose'

const issueSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  body: {
    type: String,
    required: [true, 'Body/description is required'],
    trim: true,
    maxlength: [1000, 'Body cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  }
}, {
  timestamps: true
})

// Index for fast query of issues raised to/by someone
issueSchema.index({ studentId: 1 })
issueSchema.index({ teacherId: 1 })

const Issue = mongoose.model('Issue', issueSchema)

export default Issue
