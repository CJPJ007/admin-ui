'use client'
import type React from 'react'

const SkeletonBox = ({
  width,
  height,
}: {
  width?: string | number
  height?: string | number
}) => (
  <div
    style={{
      width: width || '100%',
      height: height || '2.5rem',
      backgroundColor: '#e0e0e0',
      borderRadius: '4px',
    }}
  ></div>
)

const SkeletonLoader = () => {
  const pulseStyle = {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  }

  return (
    <div style={{ padding: '2rem' }}>
      <style>
        {`
          @keyframes pulse {
            50% {
              opacity: .5;
            }
          }
        `}
      </style>
      <div style={pulseStyle}>
        {/* Title skeleton */}
        <div style={{ marginBottom: '2rem' }}>
          <SkeletonBox width="25%" height="2rem" />
        </div>

        {/* Form skeleton */}
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: '1rem' }}>
            {[...Array(6)].map((_, i) => <SkeletonBox key={i} />)}
        </div>

        {/* Table skeleton */}
        <div style={{ marginTop: '3rem' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(8, 1fr)', marginBottom: '1rem' }}>
            {[...Array(8)].map((_, i) => <SkeletonBox key={i} height="1.5rem" />)}
          </div>
          {/* Table body */}
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(8, 1fr)', marginBottom: '0.75rem' }}>
              {[...Array(8)].map((_, j) => <SkeletonBox key={j} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkeletonLoader
