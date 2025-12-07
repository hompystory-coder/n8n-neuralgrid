// Direct build without workspace issues
const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Starting direct build...');

// Set environment
process.env.DATABASE_URL = 'postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434';
process.env.NEXTAUTH_URL = 'http://115.91.5.140:3000';
process.env.NEXTAUTH_SECRET = 'fA51L/U0OBVL0DgscgOeJJyZe4oXRA80fax0x/ybvYA=';

try {
  // Use npx to run next build
  console.log('Running: npx next@14.2.33 build');
  execSync('npx next@14.2.33 build', {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env
  });
  
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
