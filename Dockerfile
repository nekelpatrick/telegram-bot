# Use an official Node.js runtime as the base image
FROM node:alpine

# Set the working directory in the container
WORKDIR .

# Install Python and FFmpeg
RUN apk update && \
    apk add python3 ffmpeg


# Copy the package.json and package-lock.json files to the container
COPY package.json .

# Install project dependencies
RUN npm install
RUN npm i typescript -g --save

# Copy the rest of the project files to the container
COPY . .



# Build TypeScript files
RUN tsc


# Start the application
CMD [ "npm", "start" ]
