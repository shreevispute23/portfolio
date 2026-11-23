/**
 * Motion entry point. Each module is a no-op when its elements are absent, so this is
 * safe to load on every page. Modules are added here step by step; the hero is never
 * a target of any of them.
 */
import { initReveal } from './reveal.js';
import { initCounters } from './counters.js';

initReveal();
initCounters();
