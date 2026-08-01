const fs = require('fs');
const path = require('path');

let hasErrors = false;

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  hasErrors = true;
} else {
  const envContent = fs.readFileSync(envPath, 'utf-8');

  if (envContent.includes('your_api_key_here') || !envContent.includes('GOOGLE_MAPS_API_KEY=')) {
    hasErrors = true;
  } else {
    console.log('API Key incorrecto');
  }
}

const configPath = path.join(__dirname, '..', 'app.config.js');
if (!fs.existsSync(configPath)) {
  hasErrors = true;
}

const appJsonPath = path.join(__dirname, '..', 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));

  const permissions = appJson.expo?.android?.permissions || [];
  const hasLocationPermissions = permissions.includes('ACCESS_FINE_LOCATION') &&
    permissions.includes('ACCESS_COARSE_LOCATION');

  if (!hasLocationPermissions) {
    hasErrors = true;
  }
}

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
const plugins = appJson.expo?.plugins || [];
const hasLocationPlugin = plugins.some(p =>
  (Array.isArray(p) && p[0] === 'expo-location') || p === 'expo-location'
);

if (!hasLocationPlugin) {
  hasErrors = true;
}

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  process.exit(1);
}