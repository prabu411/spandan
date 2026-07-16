import mongoose from 'mongoose'

const exitTicketSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  prompt: {
    type: String,
    default: "What was the most important thing you learned today, and what is still unclear?"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const exitTicketResponseSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  exitTicketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExitTicket',
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  pace: {
    type: String,
    enum: ['too-fast', 'just-right', 'too-slow'],
    default: 'just-right'
  },
  understanding: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const ExitTicket = mongoose.model('ExitTicket', exitTicketSchema)
export const ExitTicketResponse = mongoose.model('ExitTicketResponse', exitTicketResponseSchema)
