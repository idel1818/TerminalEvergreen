import { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Globe, MapPin } from 'lucide-react';

export default function BattleMapPage() {
  const { workspace, config } = useWorkspace();
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cleanupRef = useRef(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    if (!workspace) return;
    fetch(`/api/workspaces/${workspace.id}/accounts`).then(r => r.json()).then(setAccounts);
  }, [workspace]);

  useEffect(() => {
    if (!containerRef.current) return;

    let THREE;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      THREE = window.THREE;
      initGlobe(THREE);
    };
    document.head.appendChild(script);

    let animationId;
    let scene, camera, renderer, globe, dots;

    function initGlobe(THREE) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
      camera.position.z = 3;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const material = new THREE.MeshPhongMaterial({
        color: 0x0a0e1a,
        emissive: 0x0a1628,
        specular: 0x3b82f6,
        shininess: 15,
        wireframe: false,
        transparent: true,
        opacity: 0.9,
      });
      globe = new THREE.Mesh(geometry, material);
      scene.add(globe);

      const wireGeo = new THREE.SphereGeometry(1.002, 36, 36);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, wireframe: true, transparent: true, opacity: 0.3 });
      const wireframe = new THREE.Mesh(wireGeo, wireMat);
      globe.add(wireframe);

      const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0x3b82f6, 0.8);
      directionalLight.position.set(5, 3, 5);
      scene.add(directionalLight);

      dots = new THREE.Group();
      globe.add(dots);

      const allPoints = [
        ...(accounts || []).map(a => ({ lat: a.lat, lng: a.lng, name: a.name, type: 'account', color: 0x3b82f6 })),
        ...((config?.battle_map?.hq_locations || []).map(h => ({ lat: h.lat, lng: h.lng, name: h.name, type: 'hq', color: 0x10b981 }))),
      ];

      allPoints.forEach(p => {
        if (!p.lat || !p.lng) return;
        const phi = (90 - p.lat) * (Math.PI / 180);
        const theta = (p.lng + 180) * (Math.PI / 180);
        const x = -(1.02) * Math.sin(phi) * Math.cos(theta);
        const y = (1.02) * Math.cos(phi);
        const z = (1.02) * Math.sin(phi) * Math.sin(theta);

        const dotGeo = new THREE.SphereGeometry(p.type === 'hq' ? 0.025 : 0.015, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: p.color });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(x, y, z);
        dot.userData = p;
        dots.add(dot);
      });

      let isDragging = false;
      let previousMouse = { x: 0, y: 0 };
      let rotationVelocity = { x: 0.002, y: 0 };

      const onMouseDown = (e) => {
        isDragging = true;
        previousMouse = { x: e.clientX, y: e.clientY };
      };
      const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - previousMouse.x;
        const dy = e.clientY - previousMouse.y;
        rotationVelocity.x = dx * 0.005;
        rotationVelocity.y = dy * 0.005;
        previousMouse = { x: e.clientX, y: e.clientY };
      };
      const onMouseUp = () => { isDragging = false; };

      const container = containerRef.current;
      container.addEventListener('mousedown', onMouseDown);
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseup', onMouseUp);

      function animate() {
        animationId = requestAnimationFrame(animate);
        globe.rotation.y += rotationVelocity.x;
        globe.rotation.x += rotationVelocity.y;
        if (!isDragging) {
          rotationVelocity.x *= 0.98;
          rotationVelocity.y *= 0.95;
          if (Math.abs(rotationVelocity.x) < 0.001) rotationVelocity.x = 0.001;
        }
        renderer.render(scene, camera);
      }
      animate();

      const handleResize = () => {
        if (!containerRef.current) return;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      cleanupRef.current = () => {
        container.removeEventListener('mousedown', onMouseDown);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (rendererRef.current) rendererRef.current.dispose();
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [accounts, config]);

  const hqLocations = config?.battle_map?.hq_locations || [];
  const deployedAccounts = config?.battle_map?.deployed_accounts || [];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Globe size={22} className="text-blue-400" /> Battle Map
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#131a2e] border border-[#1e293b] rounded-xl overflow-hidden" style={{ height: '500px' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div className="space-y-4">
          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-400">Target Accounts ({accounts.filter(a => a.lat).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">HQ Locations ({hqLocations.length})</span>
              </div>
            </div>
          </div>

          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-400" /> HQ Locations
            </h3>
            <div className="space-y-2">
              {hqLocations.map((h, i) => (
                <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {h.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#131a2e] border border-[#1e293b] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Deployed Accounts</h3>
            <div className="space-y-1">
              {deployedAccounts.map((a, i) => (
                <div key={i} className="text-xs text-emerald-400">{a}</div>
              ))}
              {deployedAccounts.length === 0 && <div className="text-xs text-slate-500">No deployments yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
