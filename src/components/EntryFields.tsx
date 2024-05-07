"use client";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";

import { LoadScript } from "@react-google-maps/api";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useRef, useState } from "react";

const center = { lat: 48.8584, lng: 2.2945 };

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [routeOrigin, setRouteOrigin] = useState(null); // Will be an object like { lat: ..., lng: ... }
  const [durationInSeconds, setDurationInSeconds] = useState(0);
 
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  async function calculateRoute() {
    const origin = originRef.current?.value;
    const destination = destinationRef.current?.value;

    if (!origin || !destination) {
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    if (
      results.routes &&
      results.routes.length > 0 &&
      results.routes[0].legs &&
      results.routes[0].legs.length > 0
    ) {
      const leg = results.routes[0].legs[0];
      setDirectionsResponse(results);
      setDistance(leg.distance?.text || "");
      setDuration(leg.duration?.text || "");
    } else {
      setDirectionsResponse(null);
      setDistance("");
      setDuration("");
    }
  }

  async function getCurrentLocation() {
    if (!duration) {
      // Handle the case where calculateRoute hasn't been called yet
      alert(
        "Please calculate a route first before getting the current location."
      );
      return;
    }

    const durationInSeconds = parseInt(duration.split(" ")[0]); // Get duration in seconds (assuming format like "15 mins")
    const remainingDuration = durationInSeconds - durationInSeconds * 0.4; // Remaining duration after 40% deduction
    const portionCompleted = remainingDuration / durationInSeconds; // Percentage of trip completed

    if (!directionsResponse || !directionsResponse.routes) {
      return;
    }

    const route = directionsResponse.routes[0];
    const leg = route.legs[0];
    const totalDistance = leg.distance?.value || 0;
    const distanceCompleted = totalDistance * (1 - portionCompleted); // Distance already covered

    let accumulatedDistance = 0;
    let probableLocation = null;

    // Iterate through steps to find probable location
    for (const step of leg.steps) {
      // Check if step.distance is defined before accessing its value
      if (step.distance && step.distance.value) {
        const stepDistance = step.distance.value;
        if (accumulatedDistance + stepDistance >= distanceCompleted) {
          const ratio =
            (distanceCompleted - accumulatedDistance) / stepDistance;
          const lat =
            step.start_location.lat() +
            (step.end_location.lat() - step.start_location.lat()) * ratio;
          const lng =
            step.start_location.lng() +
            (step.end_location.lng() - step.start_location.lng()) * ratio;
          probableLocation = { lat, lng };
          break;
        }
        accumulatedDistance += stepDistance;
      }
    }

    if (probableLocation) {
      // Set the probable location as the new center of the map
      map?.panTo(probableLocation);
      const remainingDistance = (totalDistance - accumulatedDistance) / 1000; // Convert accumulated distance to kilometers
      console.log("Remaining Distance:", remainingDistance, "km");
      displayNearbyEVChargingStations()
      map?.setZoom(15);
    }
  }
  async function displayNearbyEVChargingStations() {
    let markers: google.maps.Marker[] = []; // Declare markers array within the function
  
    if (!map) {
      // Ensure the map is loaded before proceeding
      return;
    }
  
    // Define the request parameters for the Places Nearby Search API
    const request: google.maps.places.PlaceSearchRequest = {
      location: map.getCenter(), // Use the center of the map as the reference point
      radius: 10000, // Search within a radius of 10 kilometers (adjust as needed)
      type: 'charging_station', // Specify the type of place (charging station)
      keyword: 'electric vehicle charging', // Specify keywords related to electric vehicle charging
    };
  
    // Create a PlacesService object to execute the Places Nearby Search request
    const placesService = new google.maps.places.PlacesService(map);
  
    // Execute the Places Nearby Search request
    placesService.nearbySearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Clear existing markers (if any)
        markers.forEach(marker => marker.setMap(null));
        markers = [];
  
        // Iterate through the results and create markers for each EV charging station
        results.forEach(place => {
          if (place.geometry) {
            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
            });
            markers.push(marker);
          }
        });
      } else {
        console.error('Places Nearby Search request failed:', status);
      }
    });
  }
  

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current!.value = "";
    destinationRef.current!.value = "";
  }
  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map || null)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <HStack spacing={2} justifyContent="space-between">
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type="text" placeholder="Origin" ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>

          <ButtonGroup>
            <Button colorScheme="pink" type="submit" onClick={calculateRoute}>
              Calculate Route
            </Button>
            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={clearRoute}
            />
            <Button
              colorScheme="pink"
              type="submit"
              onClick={getCurrentLocation}
            >
              Get Current Location
            </Button>
            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: {distance} </Text>
          <Text>Duration: {duration} </Text>
          <IconButton
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map?.panTo(center);
              map?.setZoom(15);
            }}
          />
        </HStack>
      </Box>
    </Flex>
  );
}

export default App;
