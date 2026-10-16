/**
 * DEMO MODE: Mock Database
 * This is a demo configuration with hardcoded sample data
 * No database connection required - works completely offline!
 */

import { mockDB } from './mockDatabase.js';

console.log('✓ Mock Database loaded (DEMO MODE - No network required)');
console.log(`  - ${mockDB.users.length} users`);
console.log(`  - ${mockDB.jobs.length} jobs`);
console.log(`  - ${mockDB.candidates.length} candidates`);
console.log(`  - ${mockDB.interviews.length} interviews`);

// Export mock DB as default
export default mockDB;
