# Use a small Node image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the rest of the app
COPY . .

# Expose app port (we'll map it from host)
EXPOSE 3001

# Use environment variables defined at runtime
# PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
CMD ["node", "index.js"]
