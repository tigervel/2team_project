import React, { useEffect, useRef, useState } from "react";

const KakaoMapViewer = ({ startAddress, endAddress }) => {
  const mapRef = useRef(null);
  const pathRef = useRef([]);
  const markerRef = useRef(null);
  const intervalRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

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
        level: 7,
      };

      const map = new window.kakao.maps.Map(mapContainer, mapOption);
      mapRef.current = map;

      // 출발/도착 마커
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
       if (!data.routes || !data.routes[0]?.sections || !data.routes[0].sections[0]?.roads) {
      alert("경로 정보를 불러올 수 없습니다. 주소를 다시 확인해주세요.");
      return;
    }
      const path = data.routes[0].sections[0].roads.flatMap((road) =>
        road.vertexes.reduce((acc, val, idx) => {
          if (idx % 2 === 0) {
            acc.push([road.vertexes[idx + 1], road.vertexes[idx]]);
          }
          return acc;
        }, [])
      );

      const linePath = path.map(
        ([lat, lng]) => new window.kakao.maps.LatLng(lat, lng)
      );

      pathRef.current = linePath;

      // 폴리라인 표시
      new window.kakao.maps.Polyline({
        map,
        path: linePath,
        strokeWeight: 5,
        strokeColor: "#299AF0",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });

      // 이동 마커 초기 설정
      const marker = new window.kakao.maps.Marker({
        map,
        position: linePath[0],
        image: new window.kakao.maps.MarkerImage(
          "../../../image/logo/marker.png",
          new window.kakao.maps.Size(40, 40)
        ),
      });

      markerRef.current = marker;
      setCurrentIdx(0);
      setReady(true);
    };

    drawRoute();
  }, [startAddress, endAddress]);

  const handleStartPause = () => {
    const path = pathRef.current;
    const marker = markerRef.current;

    if (!isMoving) {
      // 최초 출발
      setIsMoving(true);
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setCurrentIdx((prevIdx) => {
          const nextIdx = prevIdx + 1;
          if (nextIdx < path.length) {
            marker.setPosition(path[nextIdx]);
            return nextIdx;
          } else {
            clearInterval(intervalRef.current);
            return prevIdx;
          }
        });
      }, 200);
    } else if (!isPaused) {
      // 정지
      clearInterval(intervalRef.current);
      setIsPaused(true);
    } else {
      // 재시작
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setCurrentIdx((prevIdx) => {
          const nextIdx = prevIdx + 1;
          if (nextIdx < path.length) {
            marker.setPosition(path[nextIdx]);
            return nextIdx;
          } else {
            clearInterval(intervalRef.current);
            return prevIdx;
          }
        });
      }, 200);
    }
  };

  const getButtonLabel = () => {
    if (!isMoving) return "🚚 출발";
    if (isPaused) return "▶️ 재시작";
    return "⏸ 정지";
  };

  return (
    <div>
      <div
        id="kakao-map"
        style={{ width: "100%", height: "400px", borderRadius: "10px" }}
      />
      {ready && (
        <button
          onClick={handleStartPause}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#299AF0",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {getButtonLabel()}
        </button>
      )}
    </div>
  );
};

export default KakaoMapViewer;
