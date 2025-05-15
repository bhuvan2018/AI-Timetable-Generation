FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the Next.js application
RUN npm run build

# Add a debug command to see what files are generated
RUN echo "Debug: Listing build output directory" && \
    ls -la .next/

# Expose port
EXPOSE 3000

# Start the application with the correct command
CMD ["npm", "run", "start"] 