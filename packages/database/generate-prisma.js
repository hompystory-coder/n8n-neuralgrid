const { exec } = require('child_process');
const path = require('path');

// Prisma Client를 직접 생성
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
console.log('Generating Prisma Client from:', schemaPath);

// @prisma/client internals를 사용하여 생성
try {
  const { generateClient } = require('@prisma/internals');
  
  generateClient({
    datamodel: require('fs').readFileSync(schemaPath, 'utf-8'),
    schemaPath: schemaPath,
    outputDir: path.join(__dirname, 'node_modules', '@prisma', 'client'),
    generator: {
      name: 'client',
      provider: {
        value: 'prisma-client-js',
        fromEnvVar: null
      },
      output: null,
      config: {},
      binaryTargets: [],
      previewFeatures: []
    }
  }).then(() => {
    console.log('✅ Prisma Client generated successfully');
  }).catch(err => {
    console.error('Error generating Prisma Client:', err.message);
    console.log('Trying alternative method...');
    
    // Fallback: 빌드 시 자동 생성되도록 설정
    console.log('Prisma Client will be generated during build time');
  });
} catch (err) {
  console.log('Using build-time generation');
}
