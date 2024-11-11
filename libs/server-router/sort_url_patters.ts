const get_segment_specifity = (segment: string) => {
  if (segment.startsWith('(?:/(?<') && segment.endsWith('>)?')) return 0; // Optional parameter
  if (segment.startsWith('/(?<') && segment.endsWith('>[^/]+)')) return 1; // Required parameter
  if (segment.startsWith('(?:/(?<') && segment.endsWith('>.+))?')) return 2; // Rest parameter
  return 3; // Static segment
}

export const sort_patterns = (patterns: string[]) => {
  return patterns.sort((a, b) => {
    const segmentsA = a.split('/').filter(Boolean);
    const segmentsB = b.split('/').filter(Boolean);

    const segmentDiff = segmentsB.length - segmentsA.length;
    if (segmentDiff !== 0) return segmentDiff;

    for (let i = 0; i < segmentsA.length; i++) {
      const specificityA = get_segment_specifity(segmentsA[i]);
      const specificityB = get_segment_specifity(segmentsB[i]);
      if (specificityA !== specificityB) return specificityB - specificityA;
    }

    return a.localeCompare(b);
  });
}
