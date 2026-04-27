const primaryLanguage = 'en-US'
function checkPrimary(item: any,primaryLanguage:string) {
  return Array.isArray(item) && item.some((x: any) => x._key === primaryLanguage)
    ? item.find((x: any) => x._key === primaryLanguage)?.['value']
    : item;
}

function isSafeMedia(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;

  const obj = value as { asset?: unknown };

  if ('asset' in obj) {
    const asset = obj.asset as any;

    if (asset && typeof asset === 'object') {
      if ('_ref' in asset && typeof asset._ref === 'string') {
        return true;
      }
      if ('metadata' in asset && asset.metadata && typeof asset.metadata === 'object') {
        const metadata = asset.metadata as { dimensions?: { width?: number; height?: number } };
        if (metadata.dimensions && typeof metadata.dimensions.width === 'number' && typeof metadata.dimensions.height === 'number') {
          return true;
        }
      }
    }
    return false;
  }

  return true;
}

function checkReturnI18n(obj: {
  title?: unknown;
  subtitle?: unknown;
  media?: unknown;
},primaryLanguage:string) {
  const result = {
    title: checkPrimary(obj.title,primaryLanguage),
    subtitle: checkPrimary(obj.subtitle,primaryLanguage),
    media: checkPrimary(obj.media,primaryLanguage),
  };
  if (!isSafeMedia(result.media)) {
    result.media = undefined;
  }
  return result;
}
export function handleReplacements(
  i: Record<string, unknown>,
  x: Record<string, any>,
  fallback: any,
  title?: string
) {
  const p = checkReturnI18n(i,primaryLanguage);
  if (
    typeof fallback.previewTitle === 'string' &&
    String(fallback.previewTitle).startsWith('*')
  ) {
    p.title = String(fallback.previewTitle)
      .replace('* ', '')
      .replace('*', '');
  }
  if (
    typeof fallback.previewTitle === 'string' &&
    String(fallback.previewTitle).startsWith('_type')
  ) {
    p.title = fallback.title;
  }
  if (
    typeof fallback.previewSubTitle === 'string' &&
    String(fallback.previewSubTitle).startsWith('*')
  ) {
    p.subtitle = String(fallback.previewSubTitle)
      .replace('* ', '')
      .replace('*', '');
  }
  if (
    typeof fallback.previewSubTitle === 'string' &&
    String(fallback.previewSubTitle).startsWith('_type')
  ) {
    p.subtitle = fallback.title;
  }
  return p;
}

