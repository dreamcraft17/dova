const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

/** Load root .env then apps/backend/.env (VPS often only has the latter). */
function loadDovaEnv() {
  const root = path.resolve(__dirname, '..');
  const files = [
    path.join(root, '.env'),
    path.join(root, 'apps/backend/.env'),
  ];
  for (const file of files) {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file, override: true });
    }
  }
}

module.exports = { loadDovaEnv };
