import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SpandanIcon from '../components/SpandanIcon'
import PasswordInput from '../components/PasswordInput'
import ThemeToggle from '../components/ThemeToggle'
import useThemeStore from '../stores/themeStore'
import { API_URL } from '../config.js'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { isDark, toggleTheme } = useThemeStore()

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'

  const textColor = isDark ? '#f1f5f9' : '#1e293b'
  const subTextColor = isDark ? '#94a3b8' : '#64748b'
  const cardBg = isDark ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.95)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'

  useEffect(() => {
    if (!token) {
      navigate('/')
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to reset password')

      setSuccess(true)
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bgGradient,
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.5s ease'
    }}>
      {/* Left side - Branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        position: 'relative'
      }}>
        {/* Big watermark text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-15deg)',
          fontSize: 'clamp(80px, 12vw, 160px)',
          fontWeight: '800',
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          letterSpacing: '-4px'
        }}>
          SPANDAN
        </div>
        <div style={{
          position: 'absolute',
          top: '58%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-12deg)',
          fontSize: 'clamp(60px, 10vw, 120px)',
          fontWeight: '700',
          color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          स्पंदन
        </div>

        {/* Theme toggle - top left */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: '32px',
            left: '32px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            transition: 'all 0.3s'
          }}
        >
          {isDark ? '☀️' : '🌙'}
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* Icon and brand */}
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1
        }}>
          <SpandanIcon size={50} />
        </div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '800',
          color: 'white',
          marginBottom: '16px',
          textShadow: '0 4px 30px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1
        }}>
          Spandan
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
          maxWidth: '400px',
          lineHeight: '1.6',
          position: 'relative',
          zIndex: 1
        }}>
          Your intelligent polling platform. Reset your password to continue.
        </p>
      </div>

      {/* Right side - Reset Form */}
      <div style={{
        width: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative'
      }}>
        {success ? (
          <div style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
            border: `1px solid ${cardBorder}`,
            textAlign: 'center',
            animation: 'fadeInUp 0.5s ease-out'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <span style={{ fontSize: '35px' }}>✓</span>
            </div>
            <h2 style={{ color: textColor, marginBottom: '10px' }}>Password Reset!</h2>
            <p style={{ color: subTextColor, marginBottom: '20px' }}>
              Your password has been successfully reset. Redirecting you to login...
            </p>
            <div style={{
              width: '100%',
              height: '4px',
              background: isDark ? '#334155' : '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                animation: 'shrink 3s linear forwards'
              }} />
            </div>
          </div>
        ) : (
          <div style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
            border: `1px solid ${cardBorder}`,
            animation: 'fadeInUp 0.5s ease-out'
          }}>
            {/* Logo and Title */}
            <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 15px 35px rgba(102, 126, 234, 0.35)'
              }}>
                <SpandanIcon size={35} />
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: textColor,
                marginBottom: '8px'
              }}>
                Set New Password
              </h1>
              <p style={{
                fontSize: '14px',
                color: subTextColor
              }}>
                Enter your new password below.
              </p>
            </div>

            {error && (
              <div style={{
                background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
                border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: isDark ? '#fca5a5' : '#dc2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: subTextColor,
                  marginBottom: '8px'
                }}>
                  New Password
                </label>
                <PasswordInput
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password"
                  style={{ background: isDark ? '#1e293b' : 'white' }}
                />
                <p style={{
                  fontSize: '11px',
                  color: subTextColor,
                  marginTop: '6px'
                }}>
                  Min 8 chars: 1 uppercase, 1 lowercase, 1 digit, 1 special char
                </p>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: subTextColor,
                  marginBottom: '8px'
                }}>
                  Confirm New Password
                </label>
                <PasswordInput
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  style={{ background: isDark ? '#1e293b' : 'white' }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '17px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s'
                }}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export default ResetPasswordPage