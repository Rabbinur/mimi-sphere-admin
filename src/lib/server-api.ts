const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 8000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchData(url: string, revalidate = 60) {
  try {
    const res = await fetchWithTimeout(url, {
      next: { revalidate },
    });

    if (!res.ok) {
        // console.error("API Error:", res.status, url);
      return null;
    }

    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch (error) {
    // console.error("Fetch failed:", url, error);
    return null;
  }
}

export const getProductsByCategory = (categoryId: string, limit = 5) =>
  fetchData(`${API_BASE}/products/by-category/${categoryId}?limit=${limit}`, 60);

export const getCategories = () =>
  fetchData(`${API_BASE}/categories?sub_categories=false`, 120);

export const getCMS = () =>
  fetchData(`${API_BASE}/cms`, 3600);
