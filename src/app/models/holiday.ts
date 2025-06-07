export interface Holiday {
    id?: string;
    cityName: string;
    countryCode: string;
    year: number;
    holidayDates: Array<{
        day: string,
        month: string,
        name: string
    }>;
  }