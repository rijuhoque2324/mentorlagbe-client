import { apiPost } from "@/lib/api";

export interface HostedImage {
  url: string;
  displayUrl?: string;
  thumbUrl?: string | null;
  width?: number | null;
  height?: number | null;
  size?: number;
}

function asHostedImage(payload: unknown): HostedImage {
  const record =
    payload !== null && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const url = typeof record.url === "string" ? record.url : "";

  if (!url) {
    throw new Error("The image host did not return a URL.");
  }

  return {
    url,
    displayUrl:
      typeof record.displayUrl === "string" ? record.displayUrl : undefined,
    thumbUrl: typeof record.thumbUrl === "string" ? record.thumbUrl : null,
    width: typeof record.width === "number" ? record.width : null,
    height: typeof record.height === "number" ? record.height : null,
    size: typeof record.size === "number" ? record.size : undefined,
  };
}

/**
 * Uploads an image through the API, which forwards it to ImgBB. The API key
 * stays on the server; browser code only sees the hosted URL.
 */
export const uploadService = {
  async image(file: File): Promise<HostedImage> {
    const formData = new FormData();
    formData.append("image", file);
    const payload = await apiPost<unknown>("/uploads/image", formData);
    return asHostedImage(payload);
  },
};
