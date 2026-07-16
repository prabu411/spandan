import express from 'express'
import { authenticate } from '../middleware/auth.js'
import Issue from '../models/Issue.js'
import User from '../models/User.js'

const router = express.Router()

// Apply authentication to all issues routes
router.use(authenticate)

// GET /api/issues/teachers - Retrieve all teachers (so students can select a teacher)
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }, 'name email department').lean()
    res.json({ success: true, teachers })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch teachers' })
  }
})

// POST /api/issues - Raise a new issue
router.post('/', async (req, res) => {
  try {
    const { teacherId, roomId, subject, body } = req.body
    const studentId = req.user._id

    if (!teacherId || !subject || !body) {
      return res.status(400).json({ success: false, error: 'teacherId, subject, and body are required' })
    }

    // Verify teacher exists
    const teacher = await User.findById(teacherId)
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ success: false, error: 'Invalid teacher selected' })
    }

    const issue = new Issue({
      studentId,
      teacherId,
      roomId: roomId || null,
      subject,
      body,
      status: 'open'
    })

    await issue.save()
    res.status(201).json({ success: true, issue })
  } catch (error) {
    console.error('Error creating issue:', error)
    res.status(500).json({ success: false, error: 'Failed to submit issue' })
  }
})

// GET /api/issues - Fetch issues for current student or teacher
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id
    const role = req.user.role

    let issues = []
    if (role === 'teacher') {
      issues = await Issue.find({ teacherId: userId })
        .populate('studentId', 'name email profileImage')
        .populate('roomId', 'name code')
        .sort({ createdAt: -1 })
    } else {
      issues = await Issue.find({ studentId: userId })
        .populate('teacherId', 'name email department')
        .populate('roomId', 'name code')
        .sort({ createdAt: -1 })
    }

    res.json({ success: true, issues })
  } catch (error) {
    console.error('Error fetching issues:', error)
    res.status(500).json({ success: false, error: 'Failed to retrieve issues' })
  }
})

// PATCH /api/issues/:id - Update status of an issue (e.g. resolve)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = req.user._id

    if (!status || !['open', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status update' })
    }

    const issue = await Issue.findById(id)
    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' })
    }

    // Only the assigned teacher can resolve the issue
    if (issue.teacherId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to resolve this issue' })
    }

    issue.status = status
    await issue.save()

    res.json({ success: true, issue })
  } catch (error) {
    console.error('Error updating issue status:', error)
    res.status(500).json({ success: false, error: 'Failed to update issue status' })
  }
})

export default router
