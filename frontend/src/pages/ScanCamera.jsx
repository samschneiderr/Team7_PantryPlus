import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'

function ScanCamera() {
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    let hasStarted = false
    let isStopped = false
    const scanner = new Html5Qrcode('camera-view')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          if (!isMounted || isStopped) return
          isStopped = true
          scanner
            .stop()
            .catch(() => {})
            .finally(() => {
              setTimeout(() => {
                navigate(`/add?barcode=${encodeURIComponent(decodedText)}`)
              }, 150)
            })
        },
        () => {
          // Called continuously while no barcode is found, ignore
        }
      )
      .then(() => {
        hasStarted = true
      })
      .catch((err) => {
        if (isMounted) setError('Could not access camera: ' + err)
      })

    return () => {
      isMounted = false
      if (hasStarted && !isStopped) {
        isStopped = true
        scanner.stop().catch(() => {})
      }
    }
  }, [navigate])

  return (
    <div className="page">
      <h1>Scan Food</h1>
      <p className="subtitle">Point your camera at a barcode</p>

      <div id="camera-view" className="camera-view"></div>

      {error && (
        <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '12px' }}>{error}</p>
      )}

      <button className="btn-manual" style={{ marginTop: '16px' }} onClick={() => navigate('/add')}>
        Enter manually instead
      </button>
    </div>
  )
}

export default ScanCamera