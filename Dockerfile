# Dockerfile

# Use Node.js base image
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["sh", "-c", "npm install && node server.js","node"]
