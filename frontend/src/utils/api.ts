export interface Availability {
  twinTotal: number;
  twinBooked: number;
  twinLeft: number;
  suiteTotal: number;
  suiteBooked: number;
  suiteLeft: number;
}

const apiUrl = (): string | null => {
  const url = import.meta.env.VITE_API_URL;
  if (!url || url.includes('XXXX')) return null;
  return url;
};

/** Fetch live room availability. Returns null if the endpoint isn't reachable/configured. */
export const fetchAvailability = async (): Promise<Availability | null> => {
  const url = apiUrl();
  if (!url) return null;
  try {
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    return (data && data.availability) || null;
  } catch {
    return null;
  }
};
