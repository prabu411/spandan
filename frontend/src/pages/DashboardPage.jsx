import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config.js'
import useAuthStore from '../stores/authStore'
import useRoomStore from '../stores/roomStore'
import useSocketStore from '../stores/socketStore'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import ProfileDropdown from '../components/ProfileDropdown'

function DashboardPage() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated } = useAuthStore()
  const { rooms, currentRoom, isLoading, error, fetchRooms, createRoom, setAuthToken } = useRoomStore()
  const { isConnected } = useSocketStore()
  
  const [roomName, setRoomName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [checked, setChecked] = useState(false)
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalPolls: 0,
    totalResponses: 0
  })

  // Rank-SP Leaderboard states
  const [selectedLeaderboardRoomId, setSelectedLeaderboardRoomId] = useState('')
  const [dashboardLeaderboard, setDashboardLeaderboard] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)

  // Set default leaderboard room once rooms are fetched
  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedLeaderboardRoomId) {
      setSelectedLeaderboardRoomId(rooms[0]._id)
    }
  }, [rooms])

  // Fetch leaderboard data when selected room changes
  useEffect(() => {
    if (selectedLeaderboardRoomId && token) {
      fetchDashboardLeaderboard(selectedLeaderboardRoomId)
    }
  }, [selectedLeaderboardRoomId, token])

  const fetchDashboardLeaderboard = async (rid) => {
    setLeaderboardLoading(true)
    try {
      const res = await fetch(`${API_URL}/responses/leaderboard/${rid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setDashboardLeaderboard(data.leaderboard || [])
      }
    } catch (err) {
      console.error('Failed to fetch dashboard leaderboard:', err)
    } finally {
      setLeaderboardLoading(false)
    }
  }

  // Initial setup
  useEffect(() => {
    if (token) {
      setAuthToken(token)
      fetchRooms()
      fetchTeacherStats()
    }
    setChecked(true)
  }, [token])

  const fetchTeacherStats = async () => {
    try {
      // Fetch all rooms
      const roomsRes = await fetch(`${API_URL}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const roomsData = await roomsRes.json()
      
      const allRooms = roomsData.rooms || []
      const activeRooms = allRooms.filter(r => !r.endedAt)
      
      // Fetch all questions for teacher's rooms
      let totalPolls = 0
      let totalResponses = 0
      
      for (const room of allRooms) {
        const qRes = await fetch(`${API_URL}/questions?roomId=${room._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const qData = await qRes.json()
        totalPolls += (qData.questions || []).length
        
        const rRes = await fetch(`${API_URL}/responses/stats/room/${room._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const rData = await rRes.json()
        totalResponses += (rData.stats?.totalResponses || 0)
      }
      
      setStats({
        totalRooms: allRooms.length,
        activeRooms: activeRooms.length,
        totalPolls,
        totalResponses
      })
    } catch (err) {
      console.error('Failed to fetch teacher stats:', err)
    }
  }

  // Redirect to login if no token after initial check
  useEffect(() => {
    if (checked && !token) {
      navigate('/')
    }
  }, [checked, token, navigate])

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return
    setIsCreating(true)
    try {
      await createRoom(roomName.trim())
      setRoomName('')
    } catch (err) {
      console.error('Failed to create room:', err)
    } finally {
      setIsCreating(false)
    }
  }

  // Show spinner while checking
  if (!checked) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border-color)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Stats data - default values (will update later)

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '240px'
      }}>
        {/* Header - Blue gradient bar */}
        <header style={{
          background: 'var(--header-bg)',
          color: 'white',
          padding: '24px 32px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                Welcome back, {user?.name || 'Teacher'}!
              </h1>
              <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>
                Manage your rooms and questions
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ThemeToggle />
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div style={{ flex: 1, padding: '32px' }}>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.totalRooms}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Total Rooms</div>
            </div>
            
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.activeRooms}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Active Rooms</div>
            </div>
            
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.totalPolls}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Total Polls</div>
            </div>
            
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.totalResponses}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Total Responses</div>
            </div>
          </div>

          {/* Create Room Section */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Create New Room
            </h2>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
              
              <button
                onClick={handleCreateRoom}
                disabled={isCreating || !roomName.trim()}
                style={{
                  padding: '12px 24px',
                  background: (isCreating || !roomName.trim()) ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (isCreating || !roomName.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </div>

          {/* Active Rooms & Leaderboard Two-Column Grid */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Left Column: Active Rooms */}
            <div style={{ flex: '2 1 500px', minWidth: '300px' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                🟢 My Active Rooms
              </h2>
              
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Loading rooms...
                </div>
              ) : rooms && rooms.filter(r => !r.endedAt).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {rooms.filter(r => !r.endedAt).map((room) => (
                    <div
                      key={room._id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '20px',
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        minHeight: '140px',
                        boxShadow: 'var(--card-shadow)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'var(--card-shadow)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {room.name}
                        </h3>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Code: <strong style={{ color: '#3b82f6', letterSpacing: '1px' }}>{room.code}</strong>
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {room.questionCount || 0} questions
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/teacher/room/${room._id}`)}
                        style={{
                          marginTop: '16px',
                          padding: '10px 16px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        Manage →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <p>No rooms yet. Create your first room above!</p>
                </div>
              )}
            </div>

            {/* Right Column: Rank-SP Leaderboard widget */}
            <div style={{
              flex: '1 1 320px',
              minWidth: '300px',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border-color)',
              height: 'fit-content'
            }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                🏆 Rank-SP Leaderboard
              </h2>
              
              {rooms && rooms.length > 0 ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500' }}>Select Room to View Rankings</label>
                    <select
                      value={selectedLeaderboardRoomId}
                      onChange={(e) => setSelectedLeaderboardRoomId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {rooms.map(r => (
                        <option key={r._id} value={r._id}>{r.name} ({r.code})</option>
                      ))}
                    </select>
                  </div>

                  {leaderboardLoading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '2.5px solid var(--border-color)',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 8px'
                      }} />
                      Loading rankings...
                    </div>
                  ) : dashboardLeaderboard.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                      {dashboardLeaderboard.map((entry) => (
                        <div
                          key={entry.studentId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            background: entry.rank === 1 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' :
                                         entry.rank === 2 ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' :
                                         entry.rank === 3 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'var(--bg-primary)',
                            borderRadius: '8px',
                            border: entry.rank <= 3 
                              ? `1.5px solid ${entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#9ca3af' : '#d97706'}` 
                              : '1px solid var(--border-color)'
                          }}
                        >
                          <span style={{ fontSize: '15px' }}>
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}.`}
                          </span>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {entry.studentName}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                              {entry.correctCount}/{entry.totalAnswered} correct
                            </div>
                          </div>

                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#3b82f6', whiteSpace: 'nowrap' }}>
                            {entry.totalPoints} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      📭 No student responses yet.
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No rooms created yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage