# Use a Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install http-server globally
RUN npm install -g http-server

# Copy your frontend files
COPY . .

# Expose port http-server will run on
EXPOSE 8080

# Start the server
CMD ["http-server", ".", "-p", "8080"]
