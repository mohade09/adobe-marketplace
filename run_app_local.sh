#!/bin/bash

# Run the Databricks App locally for debugging
# This helps debug deployment issues by running the app locally with debug mode
# Usage: ./run_app_local.sh [--verbose]

set -e

# Parse command line arguments
VERBOSE=false
if [[ "$1" == "--verbose" ]]; then
  VERBOSE=true
  echo "🔍 Verbose mode enabled"
fi

# Function to print timing info
print_timing() {
  if [ "$VERBOSE" = true ]; then
    echo "⏱️  $(date '+%H:%M:%S') - $1"
  fi
}

# Load environment variables from .env.local if it exists
print_timing "Loading environment variables"
if [ -f .env.local ]; then
  # Source but don't export all variables yet
  source .env.local
fi

# Validate required configuration
if [ -z "$DATABRICKS_APP_NAME" ]; then
  echo "❌ DATABRICKS_APP_NAME is not set. Please run ./setup.sh first."
  exit 1
fi

if [ -z "$DATABRICKS_AUTH_TYPE" ]; then
  echo "❌ DATABRICKS_AUTH_TYPE is not set. Please run ./setup.sh first."
  exit 1
fi

if [ -z "$DBA_SOURCE_CODE_PATH" ]; then
  echo "❌ DBA_SOURCE_CODE_PATH is not set. Please run ./setup.sh first."
  exit 1
fi

# Handle authentication based on type
print_timing "Starting authentication"
echo "🔐 Authenticating with Databricks..."

if [ "$DATABRICKS_AUTH_TYPE" = "pat" ]; then
  # PAT Authentication
  if [ -z "$DATABRICKS_HOST" ] || [ -z "$DATABRICKS_TOKEN" ]; then
    echo "❌ PAT authentication requires DATABRICKS_HOST and DATABRICKS_TOKEN. Please run ./setup.sh first."
    exit 1
  fi

  echo "Using Personal Access Token authentication"
  export DATABRICKS_HOST="$DATABRICKS_HOST"
  export DATABRICKS_TOKEN="$DATABRICKS_TOKEN"

  echo $DATABRICKS_HOST
  echo $DATABRICKS_TOKEN
  # Test connection
  set +e  # Temporarily disable strict error handling
  uvx --from databricks-cli databricks current-user me &>/dev/null
  auth_result=$?
  set -e  # Re-enable strict error handling

  if [ $auth_result -ne 0 ]; then
    echo "❌ PAT authentication failed. Please check your credentials."
    exit 1
  fi
  
elif [ "$DATABRICKS_AUTH_TYPE" = "profile" ]; then
  # Profile Authentication
  if [ -z "$DATABRICKS_CONFIG_PROFILE" ]; then
    echo "❌ Profile authentication requires DATABRICKS_CONFIG_PROFILE. Please run ./setup.sh first."
    exit 1
  fi

  echo "Using profile authentication: $DATABRICKS_CONFIG_PROFILE"
  # Only export the profile variable for profile authentication
  export DATABRICKS_CONFIG_PROFILE="$DATABRICKS_CONFIG_PROFILE"
  
  # Test connection
  set +e  # Temporarily disable strict error handling
  if [ "$VERBOSE" = true ]; then
    echo "Running: uvx --from databricks-cli databricks current-user me --profile \"$DATABRICKS_CONFIG_PROFILE\""
    uvx --from databricks-cli databricks current-user me --profile "$DATABRICKS_CONFIG_PROFILE"
    auth_result=$?
  else
    uvx --from databricks-cli databricks current-user me --profile "$DATABRICKS_CONFIG_PROFILE" &>/dev/null
    auth_result=$?
  fi
  set -e  # Re-enable strict error handling

  if [ $auth_result -ne 0 ]; then
    echo "❌ Profile authentication failed (exit code: $auth_result). Please check your profile configuration."
    exit 1
  fi
  
else
  echo "❌ Invalid DATABRICKS_AUTH_TYPE: $DATABRICKS_AUTH_TYPE. Must be 'pat' or 'profile'."
  exit 1
fi

echo "✅ Databricks authentication successful"
print_timing "Authentication completed"

# Display app info
echo ""
echo "🐛 Running Databricks App Locally for Debugging"
echo "📱 App Name: $DATABRICKS_APP_NAME"
echo "📂 Source Path: $DBA_SOURCE_CODE_PATH"
echo ""

# Check if run-local command is available
print_timing "Checking CLI version"
if ! uvx --from databricks-cli databricks apps run-local --help &>/dev/null; then
  echo "❌ The 'uvx databricks apps run-local' command is not available in your CLI version."
  echo "💡 You may need to update your Databricks CLI to use this feature."
  echo ""
  echo "To update the Databricks CLI:"
  echo "   # macOS/Linux with Homebrew:"
  echo "   brew upgrade databricks"
  echo ""
  echo "   # Windows with WinGet:"
  echo "   winget upgrade databricks.databricks"
  echo ""
  echo "   # Cross-platform with curl:"
  echo "   curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh"
  echo ""
  echo "📚 See official installation docs: https://docs.databricks.com/aws/en/dev-tools/cli/install"
  echo ""
  echo "Current CLI version:"
  uvx --from databricks-cli databricks --version
  echo ""
  echo "Alternative debugging approaches:"
  echo "   1. Use ./app_status.sh --verbose to check deployment status"
  echo "   2. Visit your app URL + /logz in browser for deployment logs"
  echo "   3. Check the workspace files are synced correctly"
  echo "   4. Try redeploying with ./deploy.sh"
  exit 1
fi

# Run the app locally with debug mode
print_timing "Starting local app run"
echo "🚀 Running app locally with debug mode..."
echo "💡 This will help identify deployment issues by running the app locally"
echo ""

if [ "$DATABRICKS_AUTH_TYPE" = "profile" ]; then
  if [ "$VERBOSE" = true ]; then
    echo "Running: uvx --from databricks-cli databricks apps run-local --prepare-environment --debug --profile $DATABRICKS_CONFIG_PROFILE"
    uvx --from databricks-cli databricks apps run-local --prepare-environment --debug --profile "$DATABRICKS_CONFIG_PROFILE"
  else
    uvx --from databricks-cli databricks apps run-local --prepare-environment --debug --profile "$DATABRICKS_CONFIG_PROFILE"
  fi
else
  if [ "$VERBOSE" = true ]; then
    echo "Running: uvx --from databricks-cli databricks apps run-local --prepare-environment --debug"
    uvx --from databricks-cli databricks apps run-local --prepare-environment --debug
  else
    uvx --from databricks-cli databricks apps run-local --prepare-environment --debug
  fi
fi

print_timing "Local app run completed"

echo ""
echo "✅ Local app run completed!"
echo ""
echo "💡 Useful next steps:"
echo "   - Check the debug output above for any errors"
echo "   - If the app runs locally but fails in deployment, check workspace sync"
echo "   - Use ./app_status.sh --verbose to check deployment status"
echo "   - Visit the app URL + /logz in browser for deployment logs"
echo "   - Try deploying again with ./deploy.sh"