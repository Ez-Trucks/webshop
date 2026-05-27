export interface Part {
  id: string;
  name: string;
  partNumber: string;
  model: string;
  category: string;
  condition: 'used' | 'new';
  price: number;
  image: string;
}

export function getPartImages(part: Pick<Part, 'image'> | null | undefined): string[] {
  const rawImage = part?.image?.trim();

  if (!rawImage) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawImage) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.filter((image): image is string => typeof image === 'string' && image.trim().length > 0);
    }
  } catch {
    return [rawImage];
  }

  return [rawImage];
}

export function getPrimaryPartImage(
  part: Pick<Part, 'image'> | null | undefined,
  fallback = 'images/ez-logo-factuur-2026.png?v=2',
): string {
  return getPartImages(part)[0] || fallback;
}

