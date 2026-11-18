import { describe, expect, it } from 'vitest'
import { reachableShared } from './reachableShared'

describe('reachableShared', () => {
  it('drops the localhost placeholder on the cloud site', () => {
    expect(reachableShared('http://localhost:8090', 'smartcattle2-frontend.onrender.com')).toBeNull()
    expect(reachableShared('http://127.0.0.1:8090/', 'smartcattle2-frontend.onrender.com')).toBeNull()
  })
  it('keeps a loopback service when the page runs on the same machine', () => {
    expect(reachableShared('http://localhost:8090', 'localhost')).toBe('http://localhost:8090')
  })
  it('keeps a real public service', () => {
    expect(reachableShared('https://vision.example.com', 'smartcattle2-frontend.onrender.com')).toBe('https://vision.example.com')
  })
  it('has nothing to offer without a service', () => {
    expect(reachableShared(null, 'localhost')).toBeNull()
  })
})
