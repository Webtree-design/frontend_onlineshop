## Use Node Slim image
FROM node:18

COPY package.json .

RUN npm install
#RUN npm run build:ssr #run manually  
COPY . .

EXPOSE 4010

CMD ["node", "dist/frontend_onlineshop/server/main.js"]