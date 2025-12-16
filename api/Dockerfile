FROM golang:1.24.1 as builder

# 设置工作目录
WORKDIR /app

# 设置GOPROXY为中国大陆代理
ENV GOPROXY=https://goproxy.cn,direct

# 安装构建依赖(使用阿里云Debian镜像源)
RUN echo "deb https://mirrors.aliyun.com/debian/ bookworm main contrib non-free\n\
deb https://mirrors.aliyun.com/debian/ bookworm-updates main contrib non-free\n\
deb https://mirrors.aliyun.com/debian-security bookworm-security main" > /etc/apt/sources.list && \
    apt-get update -o Acquire::Retries=3 -o Acquire::http::Timeout=10 && \
    apt-get install -y --no-install-recommends gcc libc6-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 复制go.mod和go.sum文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用 (修正CGO设置)
RUN CGO_ENABLED=1 go build -a -o /app/53AIHub -ldflags '-X "github.com/53AI/53AIHub/config.VersionTime=$(date +%Y%m%d%H%M%S)" -extldflags "-static"' ./main.go

# 使用精简的Alpine镜像作为运行时
FROM alpine:3.18

# 安装SQLite运行时依赖和C库
RUN apk --no-cache add ca-certificates sqlite libc6-compat

# 从构建阶段复制可执行文件
COPY --from=builder /app/53AIHub /app/

# 暴露端口
EXPOSE 3000

# 设置启动命令
CMD ["/app/53AIHub"]