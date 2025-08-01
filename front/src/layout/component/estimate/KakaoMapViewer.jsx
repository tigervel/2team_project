import React, { useEffect, useRef } from "react";

const KakaoMapViewer = ({ startAddress, endAddress }) => {
  const mapRef = useRef(null);

  const REST_API_KEY = "d381d00137ba5677a3ee0355c4c95abf";

  useEffect(() => {
    if (!startAddress || !endAddress) return;

    const fetchCoords = async (address) => {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        {
          headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
        }
      );
      const data = await res.json();
      const loc = data.documents[0];
      return { lat: parseFloat(loc.y), lng: parseFloat(loc.x) };
    };

    const drawRoute = async () => {
      const start = await fetchCoords(startAddress);
      const end = await fetchCoords(endAddress);

      const mapContainer = document.getElementById("kakao-map");
      const mapOption = {
        center: new window.kakao.maps.LatLng(start.lat, start.lng),
        level: 10,
      };

      const map = new window.kakao.maps.Map(mapContainer, mapOption);
      mapRef.current = map;

      // 출발지/도착지 마커
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(start.lat, start.lng),
        title: "출발지",
      });

      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(end.lat, end.lng),
        title: "도착지",
      });

      // 경로 요청
      const res = await fetch(
        `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}`,
        {
          headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
        }
      );
      const data = await res.json();
      const path = data.routes[0].sections[0].roads.flatMap((road) =>
        road.vertexes.reduce((acc, val, idx) => {
          if (idx % 2 === 0) {
            acc.push([
              road.vertexes[idx + 1], // lat
              road.vertexes[idx],     // lng
            ]);
          }
          return acc;
        }, [])
      );

      const linePath = path.map(
        ([lat, lng]) => new window.kakao.maps.LatLng(lat, lng)
      );

      new window.kakao.maps.Polyline({
        map,
        path: linePath,
        strokeWeight: 5,
        strokeColor: "#299AF0",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
    };

    drawRoute();
  }, [startAddress, endAddress]);

  return (
    <div
      id="kakao-map"
      style={{ width: "100%", height: "400px", borderRadius: "10px" }}
    />
  );
};

export default KakaoMapViewer;
