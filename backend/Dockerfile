FROM node:20-bookworm

WORKDIR /app

# Install system dependencies including Rust for Walrus
RUN apt-get update && \
    apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    curl \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Clone MystenLabs Walrus Sites
RUN git clone https://github.com/MystenLabs/walrus-sites.git
WORKDIR /app/walrus-sites
RUN cargo build --release

# Go back to app directory
WORKDIR /app

# Copy package files for better caching
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