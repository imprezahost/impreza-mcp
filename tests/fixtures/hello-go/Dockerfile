FROM golang:1.23-alpine AS build
WORKDIR /src
COPY main.go ./
RUN go build -o /out/hello main.go

FROM alpine:3.21
COPY --from=build /out/hello /usr/local/bin/hello
EXPOSE 80
ENTRYPOINT ["/usr/local/bin/hello"]
