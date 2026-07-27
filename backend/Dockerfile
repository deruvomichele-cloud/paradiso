FROM golang:1.25-alpine AS build
WORKDIR /src
RUN apk add --no-cache ca-certificates git
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend ./backend
RUN CGO_ENABLED=0 GOOS=linux go build -C backend -trimpath -ldflags="-s -w" -o /out/paradiso-api ./cmd/api
COPY *.html *.css *.js ./
COPY robots.txt sitemap.xml ./
COPY assets ./assets
RUN mkdir -p /out/site && cp ./*.html ./*.css ./*.js ./robots.txt ./sitemap.xml /out/site/ && cp -R ./assets /out/site/assets

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/paradiso-api /paradiso-api
COPY --from=build /out/site /srv/site
EXPOSE 8080
ENTRYPOINT ["/paradiso-api"]
