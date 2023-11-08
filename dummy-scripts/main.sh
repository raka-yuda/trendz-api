#!/bin/bash

# Record the start time
start_time=$(date +%s)

# Check if 'node' command is available
if command node -v &> /dev/null; then
    node_version=$(node -v)
    echo "Node.js is installed (Version: $node_version)"
    filename="pltu-polusi2.csv"
    search_keyword="PLTU OR polusi geocode:-6.905006838366617,107.617868170032,10km"
    limit="1000"
    token="6b4043952b4d2d6b186e2e04657125f4ccccc239"
    command npx --yes tweet-harvest@latest -o "$filename" -s "$search_keyword" -l $limit --token "$token"
else
    echo "Node.js is not installed on this system."
fi

# Record the end time
end_time=$(date +%s)

# Calculate the execution time
execution_time=$((end_time - start_time))
echo "Script executed in $execution_time seconds."