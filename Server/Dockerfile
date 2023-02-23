# syntax=docker/dockerfile:1

FROM nikolaik/python-nodejs:python3.11-nodejs18-bullseye

ENV NODE_ENV=production



WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production


#RUN update-alternatives --install /usr/bin/python python3 /usr/local/bin/python3.11.1
RUN pip install requests_cache
COPY . .

EXPOSE 5000

CMD [ "node", "server.js" ]
