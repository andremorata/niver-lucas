FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
ENV DEBUG=*
ENV NODE_OPTIONS="--inspect=0.0.0.0:9229"
COPY . .
EXPOSE 3000
EXPOSE 9229
CMD ["npm", "run", "dev"]
