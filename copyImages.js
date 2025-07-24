const fs = require('fs-extra');
const path = require('path');

async function copyImages() {
  try {
    console.log('Copying images to dist directory...');
    
    // Define source and destination paths
    const imagesSrc = path.resolve(__dirname, 'images');
    const imagesDest = path.resolve(__dirname, 'dist/images');
    
    // Check if the images directory exists
    if (!(await fs.pathExists(imagesSrc))) {
      console.log('Images source directory not found, checking public/images...');
      
      // Try the public/images directory as a fallback
      const publicImagesSrc = path.resolve(__dirname, 'public/images');
      
      if (await fs.pathExists(publicImagesSrc)) {
        console.log('Found public/images, copying to dist/images...');
        await fs.copy(publicImagesSrc, imagesDest);
        console.log('Successfully copied public/images to dist/images');
      } else {
        console.error('No images directory found in either root or public/ directories!');
        return;
      }
    } else {
      // Copy the images directory to dist
      await fs.copy(imagesSrc, imagesDest);
      console.log('Successfully copied images to dist/images');
    }
  } catch (err) {
    console.error('Error copying images:', err);
    process.exit(1);
  }
}

copyImages();
