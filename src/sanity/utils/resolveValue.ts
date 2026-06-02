export function resolveValue(
  type: 'title' | 'subtitle' | 'media',
  select: Record<any, any>,
  value: unknown,
) {
  if (type === 'title') {
    if (!('title1' in select)) {
      return value?.['title'];
    }
    return (
      value?.['title'] ||
      value?.['title1'] ||
      value?.['title2'] ||
      value?.['title3'] ||
      value?.['title4'] ||
      value?.['title5']
    );
  }
  if (type === 'subtitle') {
    if (!('subtitle1' in select)) {
      return value?.['subtitle'];
    }
    return (
      value?.['subtitle'] ||
      value?.['subtitle1'] ||
      value?.['subtitle2'] ||
      value?.['subtitle3'] ||
      value?.['subtitle4'] ||
      value?.['subtitle5']
    );
  }
  if (type === 'media') {
    if (!('media1' in select)) {
      return value?.['media'];
    }
    return (
      value?.['media'] ||
      value?.['media1'] ||
      value?.['media2'] ||
      value?.['media3'] ||
      value?.['media4'] ||
      value?.['media5']
    );
  }
  return null;
}
