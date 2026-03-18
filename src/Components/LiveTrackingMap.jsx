// import {
//   GoogleMap,
//   Marker,
//   DirectionsRenderer,
//   useJsApiLoader,
// } from "@react-google-maps/api";
// import { useEffect, useState } from "react";

// const containerStyle = {
//   width: "100%",
//   height: "400px",
// };

// const smoothMove = (prev, next) => {
//   const factor = 0.2;
//   return {
//     lat: prev.lat + (next.lat - prev.lat) * factor,
//     lng: prev.lng + (next.lng - prev.lng) * factor,
//   };
// };

// export default function LiveTrackingMap({ riderTarget, customer }) {
//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//   });

//   const [rider, setRider] = useState(null);
//   const [directions, setDirections] = useState(null);
//   const [eta, setEta] = useState(null);

//   // smooth animation
//   useEffect(() => {
//     if (!riderTarget) return;

//     const interval = setInterval(() => {
//       setRider((prev) => {
//         if (!prev) return riderTarget;
//         return smoothMove(prev, riderTarget);
//       });
//     }, 100);

//     return () => clearInterval(interval);
//   }, [riderTarget]);

//   // directions + ETA
//   useEffect(() => {
//     if (!rider || !customer) return;

//     const service = new window.google.maps.DirectionsService();

//     service.route(
//       {
//         origin: rider,
//         destination: customer,
//         travelMode: "DRIVING",
//       },
//       (result, status) => {
//         if (status === "OK") {
//           setDirections(result);
//           setEta(result.routes[0].legs[0].duration.text);
//         }
//       }
//     );
//   }, [rider]);

//   if (!isLoaded) return <p>Loading map...</p>;

//   return (
//     <div>
//       <p className="text-green-600 font-bold mb-2">ETA: {eta || "Calculating..."}</p>

//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={rider || customer}
//         zoom={14}
//       >
//         {rider && <Marker position={rider} />}
//         {customer && <Marker position={customer} />}
//         {directions && <DirectionsRenderer directions={directions} />}
//       </GoogleMap>
//     </div>
//   );
// }

import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "400px",
};

// ✅ validate coords
const isValidCoord = (loc) => {
  return (
    loc &&
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    !isNaN(loc.lat) &&
    !isNaN(loc.lng)
  );
};

// ✅ smooth animation
const smoothMove = (prev, next) => {
  const factor = 0.2;
  return {
    lat: prev.lat + (next.lat - prev.lat) * factor,
    lng: prev.lng + (next.lng - prev.lng) * factor,
  };
};

export default function LiveTrackingMap({ riderTarget, customer }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [rider, setRider] = useState(null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);

  // ✅ ensure numbers
  const safeCustomer = isValidCoord(customer)
    ? {
        lat: Number(customer.lat),
        lng: Number(customer.lng),
      }
    : null;

  const safeTarget = isValidCoord(riderTarget)
    ? {
        lat: Number(riderTarget.lat),
        lng: Number(riderTarget.lng),
      }
    : null;

  // 🔥 smooth animation
  useEffect(() => {
    if (!safeTarget) return;

    const interval = setInterval(() => {
      setRider((prev) => {
        if (!prev) return safeTarget;
        return smoothMove(prev, safeTarget);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [safeTarget]);

  // 🔥 directions + ETA (optimized)
  useEffect(() => {
    if (!isValidCoord(rider) || !isValidCoord(safeCustomer)) return;

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: rider,
        destination: safeCustomer,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
          setEta(result.routes[0].legs[0].duration.text);
        }
      }
    );
  }, [rider, safeCustomer]);

  if (!isLoaded) return <p>Loading map...</p>;

  // ✅ safe center (fallback added)
  const safeCenter = isValidCoord(rider)
    ? rider
    : isValidCoord(safeCustomer)
    ? safeCustomer
    : { lat: 23.2599, lng: 77.4126 }; // Bhopal fallback

  return (
    <div>
      <p className="text-green-600 font-bold mb-2">
        ETA: {eta || "Calculating..."}
      </p>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={safeCenter}
        zoom={14}
      >
        {/* Rider */}
        {isValidCoord(rider) && <Marker position={rider} />}

        {/* Customer */}
        {isValidCoord(safeCustomer) && (
          <Marker position={safeCustomer} />
        )}

        {/* Route */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}