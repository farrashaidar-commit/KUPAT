export function getDashboardMetricValue(payload, pathParts = [], fallbackValue = 0) {
  const value = pathParts.reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key];
    }
    return undefined;
  }, payload);

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallbackValue;
  }

  return fallbackValue;
}
