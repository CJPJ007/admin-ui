const api = async (url: string, options?: RequestInit) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  // Add CSRF token for non-GET requests
  if (typeof window !== 'undefined') {
    // Only run this in the browser
    const Cookies = require('js-cookie');
    if (mergedOptions.method && !['GET', 'HEAD'].includes(mergedOptions.method.toUpperCase())) {
      const csrfToken = Cookies.get('XSRF-TOKEN');
      if (csrfToken) {
        mergedOptions.headers = {
          ...mergedOptions.headers,
          'X-XSRF-TOKEN': csrfToken,
        };
      }
    }
  }

  const response = await fetch(url, mergedOptions)

  if (!response.ok) {
    // Handle API errors
    const errorData = await response.text()
    throw new Error(errorData || 'Something went wrong')
  }

  return response;
}

export default api

export async function fetchViewsTrend(
  propertyId: number,
  startDate: string,
  endDate: string
) {
  const res = await api(
    `/api/property-views/trend?propertyId=${propertyId}&startDate=${startDate}&endDate=${endDate}`
  );
  return res.json();
}

export async function fetchUserAgentStats(propertyId: number) {
  const res = await api(
    `/api/property-views/user-agents?propertyId=${propertyId}`
  );
  return res.json();
}

export async function fetchTopProperties() {
  const res = await api(`/api/property-views/top-properties`);
  return res.json();
}

