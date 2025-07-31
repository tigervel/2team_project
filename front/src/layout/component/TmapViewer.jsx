import React, { useEffect, useRef } from "react";

const TmapViewer = ({ startAddress, endAddress }) => {
  const mapRef = useRef(null); // map 객체 저장용
  const mapDivRef = useRef(null); // DOM 요소 ref

  useEffect(() => {
    if (!window.Tmapv2 || !startAddress || !endAddress) return;

    const fetchCoords = async (address) => {
      const REST_API_KEY = "d381d00137ba5677a3ee0355c4c95abf";
      const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
      const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
      });
      const data = await res.json();
      const loc = data.documents[0];
      return { lat: parseFloat(loc.y), lng: parseFloat(loc.x) };
    };

    const drawRoute = async () => {
      const start = await fetchCoords(startAddress);
      const end = await fetchCoords(endAddress);

      // 초기화 (맵이 한 번 생성되었으면 destroy)
      if (mapRef.current) {
        mapRef.current.destroy(); // 이 메서드는 Tmap이 제공함
        mapRef.current = null;
      }

      const map = new window.Tmapv2.Map(mapDivRef.current, {
        center: new window.Tmapv2.LatLng(start.lat, start.lng),
        width: "100%",
        height: "400px",
        zoom: 14,
      });

      mapRef.current = map;

      new window.Tmapv2.Marker({ position: new window.Tmapv2.LatLng(start.lat, start.lng), map });
      new window.Tmapv2.Marker({ position: new window.Tmapv2.LatLng(end.lat, end.lng), map });

      const headers = {
        "Content-Type": "application/json",
        appKey: "yhqr89iIMt6BzUHVd3NPQ9Ew0XDBuXbk2NLCV3u0",
      };

      const body = {
        startX: start.lng.toString(),
        startY: start.lat.toString(),
        endX: end.lng.toString(),
        endY: end.lat.toString(),
        reqCoordType: "WGS84GEO",
        resCoordType: "WGS84GEO",
        startName: "출발지",
        endName: "도착지",
      };

      const res = await fetch("https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();

      const linePath = data.features
        .filter((item) => item.geometry.type === "LineString")
        .flatMap((item) =>
          item.geometry.coordinates.map(([lon, lat]) => new window.Tmapv2.LatLng(lat, lon))
        );

      new window.Tmapv2.Polyline({
        path: linePath,
        strokeColor: "#007bff",
        strokeWeight: 6,
        map,
      });
    };

    drawRoute();
  }, [startAddress, endAddress]);

  return (
    <div
      ref={mapDivRef}
      id="tmap"
      style={{ width: "100%", height: 400, borderRadius: 10 }}
    />
  );
};

export default TmapViewer;
