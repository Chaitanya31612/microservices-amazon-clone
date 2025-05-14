FROM golang:1.24.2-alpine AS build
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN go build -o cart

FROM alpine:latest
WORKDIR /app
COPY --from=build /app/cart .
EXPOSE 8080
CMD ["./cart"]
