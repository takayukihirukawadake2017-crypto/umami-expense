FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# ビルド引数（VITE_* 変数をビルド時に焼き込む）
ARG VITE_LIFF_ID
ARG VITE_API_BASE_URL

ENV VITE_LIFF_ID=$VITE_LIFF_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# VITE_LIFF_ID が空または PLACEHOLDER の場合はビルド失敗（vite.config.js でチェック）
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
