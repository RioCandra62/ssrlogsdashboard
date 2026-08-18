import DashboardClient from './comopnets/DashboardClient';

export default function Home() {
  const initialData = {
    failure: [],
    encoder: [],
    netburner: [],
    elev: [],
    azimuth: [],
  };

  return <DashboardClient fallbackData={initialData} />;
}
