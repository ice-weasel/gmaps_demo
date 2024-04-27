"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  DirectionsService,
  DirectionsRenderer,
  GoogleMap,
  LoadScript,
  useJsApiLoader
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "75vh",
};

const center = {
  lat: 0,
  lng: 0,
};

enum TravelMode {
  DRIVING = "DRIVING",
  BICYCLING = "BICYCLING",
  TRANSIT = "TRANSIT",
  WALKING = "WALKING",
}

const DestinationRoutes = () => {
  const router = useRouter();
  const [directions, setDirections] = useState<any>(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState(""); 
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  })

useEffect(() =>  {
  const fetchDirections = async () => {
    const { query } = router;
    const { starting, destination } = query;
    console.log('Starting address',starting)
    console.log('Destination address',destination)
    
    try {
      const directionsResponse = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${starting}&destination=${destination}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
      if (!directionsResponse.ok) {
        throw new Error(`Directions API request failed with status ${directionsResponse.status}`);
      }
      const directionsData = await directionsResponse.json();
      setDirections(directionsData);

      // Fetch distance and duration from Distance Matrix API
      const distanceMatrixResponse = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${starting}&destinations=${destination}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
      if (!distanceMatrixResponse.ok) {
        throw new Error(`Distance Matrix API request failed with status ${distanceMatrixResponse.status}`);
      }
      const distanceMatrixData = await distanceMatrixResponse.json();
      const { rows } = distanceMatrixData;
      if (rows && rows.length > 0) {
        const { elements } = rows[0];
        if (elements && elements.length > 0) {
          const { distance, duration } = elements[0];
          setDistance(distance.text);
          setDuration(duration.text);
        }
      }

  } catch (error) {
      console.error('Error fetching directions:', error);
      
  }
  };
  fetchDirections();

},[router,router.query]);




  return (
    <div>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
      >
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
          {directions && (
            <DirectionsService
              options={{
                destination: directions.routes[0].legs[0].end_location,
                origin: directions.routes[0].legs[0].start_location,
                travelMode: TravelMode.DRIVING,
              }}
              callback={(response) => {
                if (response !== null) {
                  setDirections(response);
                }
              }}
            />
          )}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default DestinationRoutes;