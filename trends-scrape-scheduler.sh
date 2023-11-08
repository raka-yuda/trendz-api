#!/bin/bash

# Define the directory where your Node.js script is located
script_directory="/path/to/your/script-directory"

# Define the Node.js script file
script_path="/src/runners/scrape-trends.js"

# Define the directory where logs should be stored
log_directory="/var/log"

# Define the timestamp for the log file
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")

# Create a folder path based on the current date
log_folder_path="$log_directory/$(date +"%Y/%m/%d")"

# Create the folder path if it doesn't exist
mkdir -p "$log_folder_path"

# Create a log file name with the timestamp
log_file="$log_folder_path/log-scrape-trends-$timestamp.log"

# Change directory to script directory
cd $script_directory

# Use nohup to run the Node.js script in the background and redirect output to the log file
nohup $node_dir "$script_directory/$script_path" >> "$log_file" 2>&1 &