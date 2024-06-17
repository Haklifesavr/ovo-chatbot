# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install --force

# Copy the entire project directory into the container
COPY . .

# Build the React app
RUN npm run build

# Set the command to start the server
CMD ["npm", "start"]
