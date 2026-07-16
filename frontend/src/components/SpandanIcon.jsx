import React from 'react'

const SpandanIcon = ({ size = 24, style = {} }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Heartbeat pulse path */}
        <path
          d="M10,50 L35,50 L42,20 L48,80 L55,30 L60,65 L65,50 L90,50"
          stroke="url(#pulseGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: '400',
            strokeDashoffset: '400',
            animation: 'pulseFlow 2s ease-in-out infinite'
          }}
        />
        
        <defs>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      
      <span 
        style={{ 
          fontSize: size * 0.7, 
          fontWeight: '800',
          fontFamily: '"Segoe UI", "Noto Sans", sans-serif',
          color: 'currentColor',
          lineHeight: 1,
          letterSpacing: '0.5px'
        }}
      >
        स्पंदन
      </span>

      <style>{`
        @keyframes pulseFlow {
          0% {
            stroke-dashoffset: 400;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default SpandanIcon