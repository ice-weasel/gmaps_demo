"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DirectionsService, DirectionsRenderer, GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '75vh',
};

const center = {
  lat: 0,
  lng: 0,
};

enum TravelMode {
    DRIVING = 'DRIVING',
    BICYCLING = 'BICYCLING',
    TRANSIT = 'TRANSIT',
    WALKING = 'WALKING'
  }
  

const DestinationRoutes = () => {
  const router = useRouter();
  const [directions, setDirections] = useState<any>(null);

  useEffect(() => {
    // Fetch directions when component mounts
    fetchDirections();
  }, []);

  const fetchDirections = async () => {
    const { query } = router;
    const { starting, destination } = query;

    if (starting && destination) {
      const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${starting}&destination=${destination}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      setDirections(data);
    }
  };

  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
          {directions && (
            <DirectionsService
              options={{
                destination: directions.routes[0].legs[0].end_location,
                origin: directions.routes[0].legs[0].start_location,
                travelMode: TravelMode.DRIVING 
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
