import axios from "axios";

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

interface OpenStreetAddress {
  village: string;
  county: string;
  state: string;
  ISO3166_2_lvl4: string;
  region: string;
  ISO3166_2_lvl3: string;
  postcode: string;
  country: string;
  country_code: string;
}

interface OpenStreetLocationResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: OpenStreetAddress;
}

const openStreetUrl = "https://nominatim.openstreetmap.org/reverse";

export const getDetailAddress = async ({
  latitude,
  longitude,
}: LocationCoordinate): Promise<OpenStreetLocationResponse> => {
  const response = await axios.get<OpenStreetLocationResponse>(openStreetUrl, {
    params: {
      format: "json",
      lat: latitude,
      lon: longitude,
    },
  });
  return response.data;
};
