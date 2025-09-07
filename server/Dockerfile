# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start backend
CMD ["npm", "start"]
