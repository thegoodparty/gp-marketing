const primaryLanguage = 'en-US'
function checkPrimary(item: any,primaryLanguage:string) {
  return Array.isArray(item) && item.some((x: any) => x._key === primaryLanguage)
    ? item.find((x: any) => x._key === primaryLanguage)?.['value']
    : item;
}

function checkReturnI18n(obj: {
  title?: unknown;
  subtitle?: unknown;
  media?: unknown;
},primaryLanguage:string) {
  return {
    title: checkPrimary(obj.title,primaryLanguage),
    subtitle: checkPrimary(obj.subtitle,primaryLanguage),
    media: checkPrimary(obj.media,primaryLanguage),
  };
}
export function handleReplacements(
  i: Record<string, unknown>,
  x: Record<string, any>,
  fallback: any,
  title?: string
) {
  const p = checkReturnI18n(i,primaryLanguage);
  if (
    typeof fallback.previewTitle === "string" &&
    String(fallback.previewTitle).startsWith("*")
  ) {
    p.title = String(fallback.previewTitle)
      .replace("* ", "")
      .replace("*", "");
  }
  if (
    typeof fallback.previewTitle === "string" &&
    String(fallback.previewTitle).startsWith("_type")
  ) {
    p.title = fallback.title;
  }
  if (
    typeof fallback.previewSubTitle === "string" &&
    String(fallback.previewSubTitle).startsWith("*")
  ) {
    p.subtitle = String(fallback.previewSubTitle)
      .replace("* ", "")
      .replace("*", "");
  }
  if (
    typeof fallback.previewSubTitle === "string" &&
    String(fallback.previewSubTitle).startsWith("_type")
  ) {
    p.subtitle = fallback.title;
  }
  return p;
}

