FROM node:18

WORKDIR /app
# Install zip and justfile
RUN apt-get update && apt-get install -y zip
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin


COPY package.json ./
RUN yarn install

COPY . .

RUN cat package.json
RUN ls -la

RUN just build
RUN just package
