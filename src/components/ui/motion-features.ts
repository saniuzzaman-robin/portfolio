import { domMax } from 'framer-motion';

// Loaded lazily by <LazyMotion> so the animation engine stays out of the critical bundle.
// domMax (not domAnimation) because the site uses layout animations and drag.
export default domMax;
