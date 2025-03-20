interface CountryData {
  tipping_customary: boolean;
  recommended_percentage: number;
}

export interface CountriesData {
  countries: {
    [key: string]: CountryData;
  };
}
