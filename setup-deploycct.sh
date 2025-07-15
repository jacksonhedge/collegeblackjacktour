#!/bin/bash

echo "Setting up /deploycct command..."

# Create a symbolic link in /usr/local/bin
sudo ln -sf /Users/jacksonfitzgerald/Documents/CollegiateCasinoLeague/collegeblackjacktour/deploycct /usr/local/bin/deploycct

# Also create with forward slash prefix for direct usage
sudo ln -sf /Users/jacksonfitzgerald/Documents/CollegiateCasinoLeague/collegeblackjacktour/deploycct /usr/local/bin/ddeploycct

echo "✅ Setup complete!"
echo ""
echo "You can now use either:"
echo "  deploycct     (without slash)"
echo "  /deploycct    (with slash - as an alias)"
echo ""
echo "From any directory to deploy your CCT app!"