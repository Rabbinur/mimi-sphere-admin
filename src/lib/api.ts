import { getProxiedUrl } from "./utils";

/**
 * Normalizes and proxies image URLs to handle external CORS or CDN issues.
 */
export function getImageUrl(imagePath?: string | null): string {
    if (!imagePath) return "/placeholder-image.png";
    return getProxiedUrl(imagePath);
}

export default {
    getImageUrl,
};
