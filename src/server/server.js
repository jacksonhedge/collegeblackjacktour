import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import uploadHandler from './uploadHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4002;

// Add middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../../../dist')));

// Use the upload handler routes
app.use('/api', uploadHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Serve index.html for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../../dist/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Available routes:');
  console.log('- POST /api/upload');
  console.log('- GET /api/getUrl');
  console.log('- All other routes serve the React app');
});
