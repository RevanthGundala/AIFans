FROM node:20-bookworm

WORKDIR /app

# Install system dependencies for XMTP
RUN apt-get update && \
    apt-get install -y python3 make g++ git && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Clear npm cache and remove any existing node_modules
RUN rm -rf node_modules && \
    npm cache clean --force

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000
ENV DSTACK_SIMULATOR_ENDPOINT="http://host.docker.internal:8090"

CMD ["npm", "start"]