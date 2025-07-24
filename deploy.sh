#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Ensure CNAME and .nojekyll are in dist
echo "Copying deployment files..."
cp public/CNAME dist/
cp public/.nojekyll dist/

# Add all changes
git add dist -f

# Commit
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
git subtree push --prefix dist origin gh-pages

echo "Deployment complete!"