/**
 * Geometric side overlay for the hero (fortemplate/Screenshot …20.47.05):
 * a repeating pinwheel tile — four chamfered blades around a square void —
 * drawn in brand navy at low opacity, with an amber cluster fading in from
 * the top-right, and the whole layer masked so it never sits under the copy.
 * Pure SVG <pattern>, no image request; decorative (aria-hidden).
 */
const BLADES = [
  "20,8 60,8 60,34 8,34 8,20", // top — chamfer top-left
  "66,8 80,8 92,20 92,60 66,60", // right — chamfer top-right
  "40,66 92,66 92,80 80,92 40,92", // bottom — chamfer bottom-right
  "8,40 34,40 34,92 20,92 8,80", // left — chamfer bottom-left
];

export function HeroPattern() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[70%] md:w-[52%] [mask-image:radial-gradient(ellipse_at_100%_0%,black_28%,transparent_72%)]">
      <svg className="h-full w-full" preserveAspectRatio="xMaxYMin slice">
        <defs>
          <pattern id="nb-pinwheel" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.6)">
            {BLADES.map((pts) => (
              <polygon key={pts} points={pts} fill="#0B1F3A" />
            ))}
          </pattern>
          <pattern id="nb-pinwheel-amber" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.6)">
            {BLADES.map((pts) => (
              <polygon key={pts} points={pts} fill="#EFA83C" />
            ))}
          </pattern>
          {/* amber cluster: strongest top-right, gone toward the centre */}
          <radialGradient id="nb-amber-cluster" cx="96%" cy="4%" r="52%">
            <stop offset="0%" stopColor="#EFA83C" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#EFA83C" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#EFA83C" stopOpacity="0" />
          </radialGradient>
          <mask id="nb-cluster-mask">
            <rect width="100%" height="100%" fill="url(#nb-amber-cluster)" />
          </mask>
        </defs>
        {/* navy blades, faint */}
        <rect width="100%" height="100%" fill="url(#nb-pinwheel)" style={{ opacity: 0.09 }} />
        {/* amber blades through the cluster mask */}
        <rect width="100%" height="100%" fill="url(#nb-pinwheel-amber)" mask="url(#nb-cluster-mask)" />
      </svg>
    </div>
  );
}
