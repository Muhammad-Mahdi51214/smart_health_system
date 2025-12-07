import  { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function HospitalMap({ hospitals = [], userLocation }) {

  // ✅ FILTER OUT BAD RECORDS (CRITICAL FIX)
  const validHospitals = hospitals.filter(h =>
    h.latitude !== null &&
    h.longitude !== null &&
    !isNaN(h.latitude) &&
    !isNaN(h.longitude)
  );

  // ✅ SAFE MAP CENTER (NEVER UNDEFINED)
  const center = userLocation
    ? userLocation
    : validHospitals.length > 0
      ? [Number(validHospitals[0].latitude), Number(validHospitals[0].longitude)]
      : [33.6844, 73.0479]; // Islamabad fallback

  if (validHospitals.length === 0) {
    return <div>No hospitals with valid location found</div>;
  }

  // ClusterLayer: groups points by pixel-grid to avoid rendering thousands of markers
  function ClusterLayer({ points, clusterPixelSize = 60 }) {
    const map = useMap();
    const [clusters, setClusters] = useState([]);

    useEffect(() => {
      if (!map) return;

      const compute = () => {
        const grid = new Map();

        for (const p of points) {
          const lat = Number(p.latitude);
          const lng = Number(p.longitude);
          if (!isFinite(lat) || !isFinite(lng)) continue;

          // Convert lat/lng to pixel coordinates at current zoom
          const point = map.latLngToLayerPoint([lat, lng]);
          const keyX = Math.floor(point.x / clusterPixelSize);
          const keyY = Math.floor(point.y / clusterPixelSize);
          const key = `${keyX}:${keyY}`;

          const existing = grid.get(key);
          if (existing) {
            existing.count += 1;
            existing.sumLat += lat;
            existing.sumLng += lng;
            existing.points.push(p);
          } else {
            grid.set(key, { count: 1, sumLat: lat, sumLng: lng, points: [p] });
          }
        }

        const out = [];
        grid.forEach((v) => {
          const lat = v.sumLat / v.count;
          const lng = v.sumLng / v.count;
          out.push({ lat, lng, count: v.count, points: v.points });
        });

        setClusters(out);
      };

      // compute now and after map moves/zooms
      compute();

      const onChange = () => compute();
      map.on('moveend zoomend resize', onChange);
      return () => map.off('moveend zoomend resize', onChange);
    }, [map, points, clusterPixelSize]);

    return (
      <>
        {clusters.map((c, idx) => {
          const position = [c.lat, c.lng];

          if (c.count === 1) {
            const hospital = c.points[0];
            return (
              <Marker
                key={`h-${hospital.hospital_id || hospital.latitude + '-' + hospital.longitude}`}
                position={position}
              >
                <Popup>
                  <div>
                    <strong>{hospital.hospital_name}</strong><br />
                    {hospital.address}<br />
                    {hospital.phone && `📞 ${hospital.phone}`}<br />
                  </div>
                </Popup>
              </Marker>
            );
          }

          // Cluster icon: simple circle with count
          const size = Math.min(50, 20 + Math.sqrt(c.count) * 6);
          const html = `
            <div style="display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(0,123,255,0.8);color:white;width:${size}px;height:${size}px;font-weight:700;box-shadow:0 0 6px rgba(0,0,0,0.3);">
              ${c.count}
            </div>
          `;

          const icon = L.divIcon({ html, className: 'cluster-div-icon', iconSize: [size, size] });

          return (
            <Marker
              key={`c-${idx}-${c.count}-${c.lat}-${c.lng}`}
              position={position}
              icon={icon}
            >
              <Popup>
                <div>
                  <strong>{c.count} hospitals</strong>
                  <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                    {c.points.slice(0, 20).map((h) => (
                      <div key={h.hospital_id || h.latitude + '-' + h.longitude}>
                        {h.hospital_name || 'Unnamed'} - {h.address || ''}
                      </div>
                    ))}
                    {c.count > 20 && <div>...and {c.count - 20} more</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  }

  return (
    <div style={{ height: '500px', width: '100%', marginTop: '20px', marginBottom: '20px' }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
       <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* ✅ CLUSTERED HOSPITAL MARKERS (replaces raw markers) */}
        <ClusterLayer points={validHospitals} clusterPixelSize={60} />

        {/* ✅ USER LOCATION — CORRECT WAY */}
        {userLocation && (
          <>
            {/* Red Dot */}
            <CircleMarker
              center={userLocation}
              radius={8}
              pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 1 }}
            />

            {/* Blue Buffer */}
            <Circle
              center={userLocation}
              radius={1000}
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
            />
          </>
        )}

      </MapContainer>
    </div>
  );
}

export default HospitalMap;
