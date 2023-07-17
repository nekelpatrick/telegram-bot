# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm install

# Install Python and FFmpeg
RUN apt-get update && \
    apt-get install -y python3 ffmpeg

# Copy the rest of the project files to the container
COPY . .

# Start the application
CMD [ "npm", "start" ]
