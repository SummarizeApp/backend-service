FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY src/assets/fonts ./src/assets/fonts/

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]