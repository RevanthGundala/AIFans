
      #!/bin/bash
      set -e
      SITE_CONTENT_PATH=$1
      BLOB_ID=$2
      cd ../walrus-sites
      echo "Current directory: $(pwd)"
      echo "Contents of current directory:"
      ls -la
      echo "Executing site-builder..."
      OUTPUT=$(./target/release/site-builder --gas-budget 500000000 publish "$SITE_CONTENT_PATH")
      echo "Raw output from site-builder:"
      echo "$OUTPUT"
      URL=$(echo "$OUTPUT" | grep -o 'https://.*\.walrus\.site')
      echo "WALRUS_URL:$URL"
    