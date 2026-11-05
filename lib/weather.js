// Town and summit weather from the National Weather Service
// (api.weather.gov). No key required; NWS asks for a descriptive
// User-Agent. Temperatures from NWS are Fahrenheit. Every failure
// returns null so weather pages render their local guide content with
// an honest "forecast unavailable" note instead of breaking.

const UA = "I15PassConditions/1.0 (contact@brightreddesign.com)";

export async function getPointWeather(lat, lon) {
  try {
    const pointRes = await fetch(
      `https://api.weather.gov/points/${lat},${lon}`,
      { headers: { "User-Agent": UA, Accept: "application/geo+json" }, next: { revalidate: 3600 } }
    );
    if (!pointRes.ok) return null;
    const point = await pointRes.json();
    const forecastUrl = point?.properties?.forecast;
    const hourlyUrl = point?.properties?.forecastHourly;
    if (!forecastUrl) return null;
    const [fcRes, hrRes] = await Promise.all([
      fetch(forecastUrl, { headers: { "User-Agent": UA, Accept: "application/geo+json" }, next: { revalidate: 1800 } }),
      hourlyUrl
        ? fetch(hourlyUrl, { headers: { "User-Agent": UA, Accept: "application/geo+json" }, next: { revalidate: 1800 } })
        : Promise.resolve(null),
    ]);
    if (!fcRes.ok) return null;
    const forecast = await fcRes.json();
    const hourly = hrRes && hrRes.ok ? await hrRes.json() : null;
    return {
      periods: forecast?.properties?.periods || [],
      hourly: (hourly?.properties?.periods || []).slice(0, 12),
    };
  } catch {
    return null;
  }
}

export async function getTownWeather(town) {
  return getPointWeather(town.lat, town.lon);
}

export async function getWeatherAlerts(town) {
  return getPointAlerts(town.lat, town.lon);
}

export async function getPointAlerts(lat, lon) {
  try {
    const res = await fetch(
      `https://api.weather.gov/alerts/active?point=${lat},${lon}`,
      { headers: { "User-Agent": UA, Accept: "application/geo+json" }, next: { revalidate: 600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.features || []).map((f) => ({
      event: f.properties?.event || "Weather alert",
      headline: f.properties?.headline || "",
      severity: f.properties?.severity || "",
      ends: f.properties?.ends || f.properties?.expires || null,
    }));
  } catch {
    return [];
  }
}
