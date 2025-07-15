#!/bin/bash

echo "🎰 Installing /deploycct command..."

# Detect shell type
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
fi

# Add alias to shell configuration
echo "" >> $SHELL_RC
echo "# CCT Deployment Command" >> $SHELL_RC
echo "alias /deploycct='/Users/jacksonfitzgerald/Documents/CollegiateCasinoLeague/collegeblackjacktour/deploycct'" >> $SHELL_RC
echo "alias deploycct='/Users/jacksonfitzgerald/Documents/CollegiateCasinoLeague/collegeblackjacktour/deploycct'" >> $SHELL_RC

echo "✅ Alias added to $SHELL_RC"
echo ""
echo "To activate the command, run:"
echo "  source $SHELL_RC"
echo ""
echo "Then you can use: /deploycct"