/**
 * Motion entry point. Each module is a no-op when its elements are absent, so this is
 * safe to load on every page. Modules are added here step by step; the hero is never
 * a target of any of them.
 *
 * Reveals run for everyone — reduced motion is softened in CSS, not removed here — so
 * effects are visible by default. After init we mark `motion-ran` so the boot's 1.5s
 * safety net knows the modules executed.
 */
import { markMotionRan } from './env.js';
import { initReveal } from './reveal.js';
import { initCounters } from './counters.js';
import { initImpact } from './impact.js';

initReveal();
initCounters();
initImpact();
markMotionRan();
