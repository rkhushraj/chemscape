import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as $3Dmol from '3dmol/build/3Dmol.es6.js'

const SURFACE_TYPE = $3Dmol.SurfaceType?.VDW ?? 1

function applyStyle(viewer, viewMode) {
  viewer.setStyle({}, {})
  if (viewMode === 'ball-stick') {
    viewer.setStyle({}, { sphere: { scale: 0.3 }, stick: { radius: 0.15 } })
  } else if (viewMode === 'cpk') {
    viewer.setStyle({}, { sphere: { scale: 1.0 } })
  } else if (viewMode === 'wireframe') {
    viewer.setStyle({}, { line: { linewidth: 2 } })
  } else if (viewMode === 'surface') {
    viewer.setStyle({}, { sphere: { scale: 0.25 }, stick: { radius: 0.12 } })
    viewer.addSurface(SURFACE_TYPE, { opacity: 0.65, colorscheme: 'ssJmol' })
  }
}

const MolViewer = forwardRef(function MolViewer({ sdf, viewMode }, ref) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const surfaceRef = useRef(null)

  useImperativeHandle(ref, () => ({
    resetView: () => {
      viewerRef.current?.zoomTo()
      viewerRef.current?.render()
    },
  }))

  // Init viewer once
  useEffect(() => {
    if (!containerRef.current) return
    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: '0x0a0a0f',
      antialias: true,
    })
    viewerRef.current = viewer
    return () => { viewer.clear() }
  }, [])

  // Load SDF whenever it changes
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    viewer.clear()
    viewer.removeAllSurfaces()
    surfaceRef.current = null
    viewer.addModel(sdf, 'sdf')
    applyStyle(viewer, viewMode)
    viewer.zoomTo()
    viewer.render()
  }, [sdf])

  // Switch view mode without reloading the model
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    viewer.removeAllSurfaces()
    surfaceRef.current = null
    applyStyle(viewer, viewMode)
    viewer.render()
  }, [viewMode])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
})

export default MolViewer
