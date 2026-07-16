import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import Room from '../models/Room.js'
import { ExitTicket, ExitTicketResponse } from '../models/ExitTicket.js'

const router = express.Router()

// Apply authentication to all endpoints
router.use(authenticate)

// POST /api/exit-tickets/:roomId - Create/launch a new exit ticket (Teacher only)
router.post('/:roomId', authorize('teacher'), async (req, res) => {
  try {
    const { roomId } = req.params
    const { prompt } = req.body

    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' })
    }

    if (room.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }

    // Set any previous active tickets to inactive
    await ExitTicket.updateMany({ roomId, isActive: true }, { isActive: false })

    const ticket = new ExitTicket({
      roomId,
      prompt: prompt || "What was the most important thing you learned today, and what is still unclear?",
      isActive: true
    })

    await ticket.save()

    res.status(201).json({ success: true, ticket })
  } catch (error) {
    console.error('Error creating exit ticket:', error)
    res.status(500).json({ success: false, error: 'Failed to create exit ticket' })
  }
})

// GET /api/exit-tickets/:roomId/active - Get the currently active exit ticket
router.get('/:roomId/active', async (req, res) => {
  try {
    const { roomId } = req.params
    const ticket = await ExitTicket.findOne({ roomId, isActive: true }).lean()
    res.json({ success: true, ticket })
  } catch (error) {
    console.error('Error fetching active exit ticket:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch active exit ticket' })
  }
})

// POST /api/exit-tickets/:roomId/respond/:ticketId - Submit response anonymously (Student only)
router.post('/:roomId/respond/:ticketId', authorize('student'), async (req, res) => {
  try {
    const { roomId, ticketId } = req.params
    const { feedback, pace, understanding } = req.body

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ success: false, error: 'Feedback field is required' })
    }

    const response = new ExitTicketResponse({
      roomId,
      exitTicketId: ticketId,
      feedback: feedback.trim(),
      pace: pace || 'just-right',
      understanding: understanding !== undefined ? parseInt(understanding) : 3
    })

    await response.save()

    res.status(201).json({ success: true, message: 'Response submitted anonymously' })
  } catch (error) {
    console.error('Error submitting exit ticket response:', error)
    res.status(500).json({ success: false, error: 'Failed to submit response' })
  }
})

// GET /api/exit-tickets/:roomId/analytics - Get exit ticket responses & statistics (Teacher only)
router.get('/:roomId/analytics', authorize('teacher'), async (req, res) => {
  try {
    const { roomId } = req.params

    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' })
    }

    if (room.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }

    // Get all exit tickets for this room
    const tickets = await ExitTicket.find({ roomId }).sort({ createdAt: -1 }).lean()

    const analytics = await Promise.all(tickets.map(async (t) => {
      const responses = await ExitTicketResponse.find({ exitTicketId: t._id }).lean()
      
      const paceCounts = { 'too-fast': 0, 'just-right': 0, 'too-slow': 0 }
      let understandingSum = 0

      responses.forEach(r => {
        if (paceCounts[r.pace] !== undefined) {
          paceCounts[r.pace]++
        }
        understandingSum += r.understanding || 3
      })

      const averageUnderstanding = responses.length > 0 ? (understandingSum / responses.length).toFixed(1) : 0

      return {
        ticketId: t._id,
        prompt: t.prompt,
        isActive: t.isActive,
        createdAt: t.createdAt,
        totalResponses: responses.length,
        paceCounts,
        averageUnderstanding,
        feedbacks: responses.map(r => ({
          feedback: r.feedback,
          pace: r.pace,
          understanding: r.understanding,
          createdAt: r.createdAt
        }))
      }
    }))

    res.json({ success: true, analytics })
  } catch (error) {
    console.error('Error fetching exit ticket analytics:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
  }
})

export default router
