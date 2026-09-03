export interface CloudinaryDeliveryAsset {
  publicId: string
  version: number
  format: string
}

async function sha1(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function signCloudinaryParams(
  params: Record<string, string | number | boolean>,
  apiSecret: string,
): Promise<string> {
  const serialized = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&')
  return sha1(`${serialized}${apiSecret}`)
}

export function cloudinaryDeliveryUrl(
  cloudName: string | undefined,
  asset: CloudinaryDeliveryAsset | null,
): string | null {
  if (!cloudName || !asset?.publicId || !asset.version || !asset.format) return null
  const publicId = asset.publicId
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/c_fill,g_auto,w_960,h_1200,f_auto,q_auto/v${asset.version}/${publicId}.${asset.format}`
}
