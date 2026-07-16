import React, { useState, useEffect } from 'react'
import useAuthStore from '../stores/authStore'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import ProfileDropdown from '../components/ProfileDropdown'
import { API_URL } from '../config.js'

function IssuesPage() {
  const { user, token } = useAuthStore()
  
  // Student states
  const [teachers, setTeachers] = useState([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  
  // Common states
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (token) {
      fetchIssues()
      if (user?.role === 'student') {
        fetchTeachers()
      }
    }
  }, [token])

  const fetchIssues = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/issues`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIssues(data.issues || [])
      } else {
        setError(data.error || 'Failed to retrieve issues')
      }
    } catch (err) {
      console.error('Error fetching issues:', err)
      setError('Connection failure loading issues')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${API_URL}/issues/teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setTeachers(data.teachers || [])
        if (data.teachers?.length > 0) {
          setSelectedTeacherId(data.teachers[0]._id)
        }
      }
    } catch (err) {
      console.error('Error fetching teachers:', err)
    }
  }

  const handleSubmitIssue = async (e) => {
    e.preventDefault()
    if (!selectedTeacherId || !subject.trim() || !body.trim()) return

    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_URL}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          subject: subject.trim(),
          body: body.trim()
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess('✓ Issue raised successfully! Your teacher will review it.')
        setSubject('')
        setBody('')
        fetchIssues() // reload lists
      } else {
        setError(data.error || 'Failed to raise issue')
      }
    } catch (err) {
      console.error('Error raising issue:', err)
      setError('Connection failure raising issue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolveIssue = async (issueId) => {
    try {
      const res = await fetch(`${API_URL}/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        fetchIssues() // reload lists
      } else {
        alert(data.error || 'Failed to resolve issue')
      }
    } catch (err) {
      console.error('Error resolving issue:', err)
      alert('Connection error resolving issue')
    }
  }

  const isTeacher = user?.role === 'teacher'

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <Sidebar user={user} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '240px' }}>
        {/* Header */}
        <header style={{
          background: 'var(--header-bg)',
          color: 'white',
          padding: '24px 32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>⚠️ Support Issues</h1>
              <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>
                {isTeacher ? 'Manage student requests and support tickets' : 'Submit an issue to your teacher'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ThemeToggle />
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Left Column: Raise Issue Form (Students only) */}
          {!isTeacher && (
            <div style={{
              flex: '1 1 350px',
              minWidth: '300px',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-color)',
              height: 'fit-content'
            }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Raise a New Issue
              </h2>

              {success && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#059669',
                  fontSize: '13px',
                  marginBottom: '16px',
                  fontWeight: '600'
                }}>
                  {success}
                </div>
              )}

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#dc2626',
                  fontSize: '13px',
                  marginBottom: '16px',
                  fontWeight: '600'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitIssue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500' }}>Select Teacher</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.department || 'General'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500' }}>Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question #3 was confusing"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500' }}>Details / Description</label>
                  <textarea
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe your issue or concern in detail..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                      minHeight: '120px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedTeacherId}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: (submitting || !selectedTeacherId) ? 'var(--border-color)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: (submitting || !selectedTeacherId) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Issue'}
                </button>
              </form>
            </div>
          )}

          {/* Right Column / Main Area: Issues History List */}
          <div style={{
            flex: '2 1 500px',
            minWidth: '320px',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-color)'
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {isTeacher ? 'Issues Raised by Students' : 'My Support Tickets'}
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading issues...</div>
            ) : issues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {issues.map(issue => (
                  <div key={issue._id} style={{
                    padding: '20px',
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    borderLeft: `5px solid ${issue.status === 'resolved' ? '#10b981' : '#f59e0b'}`,
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {issue.subject}
                      </h3>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: issue.status === 'resolved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: issue.status === 'resolved' ? '#059669' : '#d97706',
                        textTransform: 'uppercase'
                      }}>
                        {issue.status}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {issue.body}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <div>
                        {isTeacher ? (
                          <span>From: <strong>{issue.studentId?.name || 'Unknown Student'}</strong> ({issue.studentId?.email})</span>
                        ) : (
                          <span>To: <strong>{issue.teacherId?.name || 'Teacher'}</strong> ({issue.teacherId?.department || 'General'})</span>
                        )}
                        <span style={{ margin: '0 8px' }}>•</span>
                        <span>{new Date(issue.createdAt).toLocaleString()}</span>
                      </div>
                      
                      {isTeacher && issue.status === 'open' && (
                        <button
                          onClick={() => handleResolveIssue(issue._id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#10b981',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '11px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                        >
                          ✓ Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p>No issues found.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default IssuesPage
