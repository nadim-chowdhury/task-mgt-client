# Dockerfile for Frontend

# Use the official Node.js 18 image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000 (default for Next.js)
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["npx", "serve@latest", "out"]
