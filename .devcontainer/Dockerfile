FROM node:22
RUN npm install typescript eslint yarn -g

# Install just
WORKDIR /usr/bin
RUN wget https://github.com/casey/just/releases/download/1.26.0/just-1.26.0-x86_64-unknown-linux-musl.tar.gz
RUN tar -xzf just-1.26.0-x86_64-unknown-linux-musl.tar.gz
RUN chmod +x ./just
RUN rm just-1.26.0-x86_64-unknown-linux-musl.tar.gz

WORKDIR /nos2x
ENV LANG C.UTF-8

# The run the start script
CMD [ "/bin/bash" ]
