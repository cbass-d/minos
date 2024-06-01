FROM node:22-alpine as build
WORKDIR /app
COPY . ./
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

FROM node:22-alpine
RUN npm install -g serve
COPY --from=build /app/dist /public
WORKDIR /public
CMD ["serve", "-l", "3000"]
