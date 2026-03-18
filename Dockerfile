# 1. Aşama: Build (Derleme) Aşaması
FROM node:20-alpine AS build

# Konteyner içindeki çalışma dizinini belirliyoruz
WORKDIR /app

# Önce sadece package.json dosyalarını kopyalayıp bağımlılıkları kuruyoruz
# (Bu sayede kod değişse bile bağımlılıklar değişmediği sürece Docker bu adımı cache'den hızlıca geçer)
COPY package*.json ./
RUN npm install

# Kalan tüm proje dosyalarını kopyalıyoruz
COPY . .

# Vite projesini production için derliyoruz (dist klasörü oluşacak)
RUN npm run build


# 2. Aşama: Sunum (Nginx) Aşaması
FROM nginx:alpine

# Nginx'in varsayılan yayın dizinini temizliyoruz
RUN rm -rf /usr/share/nginx/html/*

# İlk aşamada (build) oluşan 'dist' klasörünü, Nginx'in yayın dizinine kopyalıyoruz
COPY --from=build /app/dist /usr/share/nginx/html

# Eğer React Router (BrowserRouter) kullanıyorsan, sayfayı yenilediğinde 404 almamak için
# tüm istekleri index.html'e yönlendirecek basit bir Nginx ayarı ekliyoruz
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Nginx 80 portundan çalışır
EXPOSE 80

# Nginx'i başlatıyoruz
CMD ["nginx", "-g", "daemon off;"]