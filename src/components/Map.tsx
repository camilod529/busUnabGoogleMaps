import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GoogleMap, InfoWindowF, Marker, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import useWebSocket from "react-use-websocket";
import mapStyles from "../assets/JSON/mapStyles.ts";
import animateMarkerTo from "../helpers/animateMarkerTo";

// Iconos marcadores mapa
import paradaMapa from "../assets/svg/parada-mapa.svg";
import busMapa from "../assets/svg/bus-mapa.svg";

// Store
import { restoreDefaultBusLocation, updateBusLocation } from "../store/route/busSlice";

// Tipado
import { RootState } from "../store/store.ts";
import { BusesState, BusMarkers, LastJsonMessage, Stop } from "../types/types";

import "../css/map.css";

const center = { lat: 7.1148017392066905, lng: -73.10797265816113 };

const busMarkers: BusMarkers = {};

export const Map = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const route = useSelector((state: RootState) => state.route.route);
  const buses: BusesState = useSelector((state: RootState) => state.buses);
  const dispatch = useDispatch();
  const { lastJsonMessage } = useWebSocket<LastJsonMessage>(
    "wss://bus.unab.edu.co/buses/location/",
    {
      onOpen: () => {
        console.log("WebSocket connection established.");
      },
      shouldReconnect: () => false,
    }
  );

  // geolocation
  useEffect(() => {
    let watchID: number;
    if ("geolocation" in navigator) {
      watchID = navigator.geolocation.watchPosition(
        function (position) {
          const userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPosition);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("No se puede obtener la ubicación");
    }
    return () => {
      navigator.geolocation.clearWatch(watchID);
    };
  }, []);
  console.log(userLocation);
  useEffect(() => {
    // Realiza la animación de los marcadores de los autobuses
    if (lastJsonMessage && lastJsonMessage.message.route == route) {
      dispatch(updateBusLocation(lastJsonMessage.message));
      const plate = lastJsonMessage.message.bus;

      const newLocation = {
        lat: parseFloat(lastJsonMessage.message.latitude),
        lng: parseFloat(lastJsonMessage.message.longitude),
      };
      if (busMarkers[plate]) {
        animateMarkerTo(busMarkers[plate].marker, newLocation);
      }
    }
  }, [lastJsonMessage, route, dispatch]);

  // * stops by route
  useEffect(() => {
    fetch(`https://bus.unab.edu.co/control/api/routes/${route}/`)
      .then((res) => res.json())
      .then((data) => {
        setStops(data.stops);
      });
    dispatch(restoreDefaultBusLocation());
  }, [route, dispatch]);

  // Cargar de mapa de Google
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAalziNd960DQofNIoW54K8z608vBZd_Ic",
  });

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "calc(100vh - 69px)",
        zIndex: 9,
      }}
      zoom={16}
      center={userLocation ? userLocation : center}
      mapTypeId="roadmap"
      options={{
        fullscreenControl: false,
        disableDoubleClickZoom: true,
        streetViewControl: false,
        zoomControl: false,
        scrollwheel: true,
        styles: mapStyles,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      }}
    >
      // * User location
      {userLocation && (
        <MarkerF
          position={userLocation}
          icon={{
            url: "https://cdn0.iconfinder.com/data/icons/user-icons-4/100/user-17-512.png",
            anchor: new google.maps.Point(17, 46),
            scaledSize: new google.maps.Size(50, 50),
            labelOrigin: new google.maps.Point(20, 65),
          }}
          zIndex={10}
        />
      )}
      {/* Bus marker */}
      {Object.keys(buses).length > 0 &&
        Object.keys(buses).map((bus: string) => {
          const busData = buses[bus]; // Accede a los datos del autobús utilizando la clave
          return (
            <Marker
              key={bus}
              icon={{
                url: busMapa,
                anchor: new google.maps.Point(17, 46),
                scaledSize: new google.maps.Size(47, 58),
                labelOrigin: new google.maps.Point(20, 65),
              }}
              position={{
                lat: parseFloat(busData.latitude),
                lng: parseFloat(busData.longitude),
              }}
              animation={google.maps.Animation.DROP}
              label={{ text: bus, color: "#dc622b", className: "label-background" }}
              ref={(marker) => {
                if (marker) busMarkers[bus] = marker;
              }}
              zIndex={100}
            />
          );
        })}
      {/* StopMarker */}
      {stops?.map((stop) => {
        return (
          <MarkerF
            key={stop.name}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            icon={{
              url: paradaMapa,
              anchor: new google.maps.Point(17, 46),
              scaledSize: new google.maps.Size(34, 37),
            }}
            zIndex={10}
            title={stop.name}
            animation={google.maps.Animation.DROP}
            onClick={() => {
              setSelectedStop(stop);
            }}
          ></MarkerF>
        );
      })}
      {selectedStop && (
        <InfoWindowF
          onCloseClick={() => setSelectedStop(null)}
          position={{
            lat: selectedStop.latitude,
            lng: selectedStop.longitude,
          }}
          options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
        >
          <div>
            <span>Estación {selectedStop.name}</span>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  ) : (
    <></>
  );
};
