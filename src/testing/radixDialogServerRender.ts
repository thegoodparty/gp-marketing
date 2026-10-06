/**
 * Import this first in a test that only server-renders something containing a
 * Radix dialog (`PledgeModal`).
 *
 * Radix decides at import time whether layout effects exist by checking
 * `globalThis.document` (`@radix-ui/react-use-layout-effect`). The DOM half of
 * the suite runs every `.test.tsx` in one process, in an order bun chooses, so
 * a server-render-only test that imports a dialog first would freeze that
 * decision to "no layout effects" for every later file, and the JSDOM tests
 * that mount a dialog (`claimFlow.test.tsx`) would then find it never opens.
 *
 * A placeholder object is enough: the check is for truthiness only, and nothing
 * Radix pulls in touches the document while it is imported. A real JSDOM here
 * is not an option; creating one at module time (even one closed straight
 * after) broke `relatedCardPledgeAttribution.test.tsx` later in the same run.
 */
const g = globalThis as { document?: unknown };
const had = 'document' in g;

if (!had) g.document = {};

await import('@radix-ui/react-dialog');

if (!had) delete g.document;
