import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlacesApiKey } from "./constants";

const placesBaseUrl = "https://places.googleapis.com";
const placesApiVersion = "v1";

type LatLng = {
  latitude: number;
  longitude: number;
};

type Options = {
  searchTerms?: string;
  radius?: number;
  pageSize?: number;
  type?: string;
};

type Place = {
  currentOpeningHours: {
    openNow: boolean;
    nextOpenTime: string;
  };
  delivery: boolean;
  dineIn: boolean;
  displayName: {
    text: string;
  };
  editorialSummary: {
    text: string;
  };
  formattedAddress: string;
  generativeSummary: {
    overview: {
      text: string;
    };
  };
  goodForGroups: boolean;
  goodForWatchingSports: boolean;
  googleMapsLinks: {
    directionsUri: string;
    photosUri: string;
    placeUri: string;
    reviewsUri: string;
  };
  googleMapsUri: string;
  id: string;
  internationalPhoneNumber: string;
  liveMusic: boolean;
  location: LatLng;
  name: string;
  outdoorSeating: boolean;
  priceLevel: string;
  priceRange: {
    endPrice: {
      currencyCode: string;
      units: string;
    };
    startPrice: {
      currencyCode: string;
      units: string;
    };
  };
  primaryType: string;
  rating: number;
  reservable: boolean;
  restroom: boolean;
  servesBeer: boolean;
  servesBreakfast: boolean;
  servesCocktails: boolean;
  servesCoffee: boolean;
  servesDessert: boolean;
  servesDinner: boolean;
  servesLunch: boolean;
  servesVegetarianFood: boolean;
  servesWine: boolean;
  takeout: boolean;
  types: string[];
  userRatingCount: number;
  websiteUri: string;
};

// 1. enable places API at https://console.cloud.google.com/google/maps-apis/api-list
// 2. create a new API key at https://console.cloud.google.com/apis/credentials
// 3. set the API key in the .env file (see env.example)
export function useNearbyPlaces(): [
  (options: Options) => Promise<void>,
  {
    searching: boolean;
    error?: string;
    places: Place[];
    location?: LatLng;
    locationTimestamp?: number;
  }
] {
  const location = useRef<LatLng>();
  const [locationTimestamp, setLocationTimestamp] = useState<number>();
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string>();
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const watchId = window.navigator.geolocation.watchPosition(
      (position) => {
        location.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocationTimestamp(position.timestamp);
      },
      (error) => {
        setError(error.message);
      }
    );
    console.log("watchId", watchId);

    return () => window.navigator.geolocation.clearWatch(watchId);
  }, []);

  const hook = useCallback(
    async ({
      searchTerms = "",
      radius = 25,
      pageSize = 10,
      type = "restaurant",
    }: Options) => {
      try {
        setSearching(true);
        setError(undefined);
        setPlaces([]);

        if (!location.current) {
          throw new Error("Waiting for GPS location...");
        }

        const response = await loadPlaces();
        setPlaces(response.data.places);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setSearching(false);
      }

      function loadPlaces() {
        if (!searchTerms) {
          // https://developers.google.com/maps/documentation/places/web-service/nearby-search
          // note that this seems to only work in certain geographic areas
          const url = `${placesBaseUrl}/${placesApiVersion}/places:searchNearby`;
          return axios.post(
            url,
            {
              includedTypes: [type],
              maxResultCount: pageSize,
              locationRestriction: {
                circle: {
                  center: location.current,
                  radius: radius,
                },
              },
            },
            {
              headers: {
                "X-Goog-Api-Key": PlacesApiKey,
                "X-Goog-FieldMask": "*",
              },
            }
          );
        }

        // https://developers.google.com/maps/documentation/places/web-service/text-search
        const url = `${placesBaseUrl}/${placesApiVersion}/places:searchText`;
        return axios.post(
          url,
          {
            textQuery: searchTerms,
            includedType: type,
            pageSize,
            locationBias: {
              circle: {
                center: location.current,
                radius: radius,
              },
            },
          },
          {
            headers: {
              "X-Goog-Api-Key": PlacesApiKey,
              "X-Goog-FieldMask": "*",
            },
          }
        );
      }
    },
    [location]
  );

  return [
    hook,
    { searching, error, places, location: location.current, locationTimestamp },
  ];
}
