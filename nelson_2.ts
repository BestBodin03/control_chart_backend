export type RuleId = 'R2';
export type Side = 'above' | 'below';

export interface SegmentR2 {
  start: number;  // inclusive
  end: number;    // inclusive
  side: Side;
}

export interface Rule2Result {
  violatingIndices: number[];
  segments: SegmentR2[];
}

/**
 * Nelson Rule 2:
 * Nine (or more) consecutive points on the same side of the mean.
 * - O(n), single pass
 * - eps: tolerance around mean considered "on mean" (breaks run)
 */
export function nelsonRule2(values: number[], mean: number, eps = 0): Rule2Result {
  const n = values.length;
  const segments: SegmentR2[] = [];
  if (n < 4) return { violatingIndices: [], segments };

  const sideOf = (v: number): -1 | 0 | 1 => {
    const d = v - mean;
    if (Math.abs(d) <= eps) return 0;
    return d > 0 ? 1 : -1;
  };

  let runSide: -1 | 0 | 1 = 0; // -1 below, 1 above, 0 none
  let runStart = 0;

  for (let i = 0; i < n; i++) {
    const s = sideOf(values[i]);

    if (s === 0) {
      // close current run
      if (runSide !== 0) {
        const runEnd = i - 1;
        const len = runEnd - runStart + 1;
        if (len >= 4) {
          segments.push({
            start: runStart,
            end: runEnd,
            side: runSide === 1 ? 'above' : 'below',
          });
        }
      }
      runSide = 0;
      runStart = i + 1;
      continue;
    }

    if (runSide === 0) {
      // start a new run
      runSide = s;
      runStart = i;
    } else if (s !== runSide) {
      // direction changed side of mean → close previous run
      const runEnd = i - 1;
      const len = runEnd - runStart + 1;
      if (len >= 4) {
        segments.push({
          start: runStart,
          end: runEnd,
          side: runSide === 1 ? 'above' : 'below',
        });
      }
      // start new run at current index
      runSide = s;
      runStart = i;
    }
    // else: continue same-side run
  }

  // finalize trailing run
  if (runSide !== 0) {
    const runEnd = n - 1;
    const len = runEnd - runStart + 1;
    if (len >= 4) {
      segments.push({
        start: runStart,
        end: runEnd,
        side: runSide === 1 ? 'above' : 'below',
      });
    }
  }

  // Mark violations: from the 9th point in each segment onward
  const mark = new Set<number>();
  for (const seg of segments) {
    for (let i = seg.start+8 ; i <= seg.end; i++) mark.add(i);
  }

  return { violatingIndices: [...mark].sort((a, b) => a - b), segments };
}

/** Convenience: boolean mask per index (true if Rule 2 violated at that point). */
export function nelsonRule2Mask(values: number[], mean: number, eps = 0): boolean[] {
  const res = nelsonRule2(values, mean, eps);
  const mask = new Array(values.length).fill(false);
  for (const i of res.violatingIndices) mask[i] = true;
  return mask;
}

