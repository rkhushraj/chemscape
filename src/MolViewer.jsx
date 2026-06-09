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

function addAtomLabels(viewer) {
  viewer.removeAllLabels()
  const model = viewer.getModel()
  if (!model) return
  model.atoms.forEach(atom => {
    if (!atom.elem) return
    viewer.addLabel(atom.elem, {
      position: { x: atom.x, y: atom.y, z: atom.z },
      fontSize: 11,
      fontColor: 'white',
      backgroundOpacity: 0.55,
      backgroundColor: 'black',
      borderThickness: 0,
      inFront: true,
      showBackground: true,
    })
  })
}

const MolViewer = forwardRef(function MolViewer({ sdf, viewMode, showLabels, spinning }, ref) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  useImperativeHandle(ref, () => ({
    resetView: () => {
      viewerRef.current?.zoomTo()
      viewerRef.current?.render()
    },
  }))

  useEffect(() => {
    if (!containerRef.current) return
    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: '0x0a0a0f',
      antialias: true,
    })
    viewerRef.current = viewer
    return () => { viewer.clear() }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    viewer.clear()
    viewer.removeAllSurfaces()
    viewer.addModel(sdf, 'sdf')
    applyStyle(viewer, viewMode)
    if (showLabels) addAtomLabels(viewer)
    viewer.zoomTo()
    viewer.render()
    if (spinning) viewer.spin('y', 0.6)
  }, [sdf])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    viewer.removeAllSurfaces()
    applyStyle(viewer, viewMode)
    if (showLabels) addAtomLabels(viewer); else viewer.removeAllLabels()
    viewer.render()
  }, [viewMode])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    if (showLabels) addAtomLabels(viewer); else viewer.removeAllLabels()
    viewer.render()
  }, [showLabels])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    if (spinning) viewer.spin('y', 0.6)
    else viewer.spin(false)
  }, [spinning])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
})

export default MolViewer
