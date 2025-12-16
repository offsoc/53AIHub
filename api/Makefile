# Go parameters
GOBIN = go
GOFMT = gofmt
GOLINT = golangci-lint
GOTEST = go test
GOBUILD = go build
GOCLEAN = go clean

# Binary name
BINARY_NAME = 53aihub
BINARY_UNIX = $(BINARY_NAME)_unix

# Output directory
BIN_DIR = bin

# Build flags
BUILD_FLAGS = -v

.PHONY: all build clean test lint fmt

all: clean fmt lint test build

build:
	$(GOBUILD) $(BUILD_FLAGS) -o $(BIN_DIR)/$(BINARY_NAME) ./main.go

sbuild:
	$(GOBUILD) $(BUILD_FLAGS) -o $(BIN_DIR)/$(BINARY_NAME) -v -ldflags="-X 'github.com/53AI/53AIHub/config.VersionTime=$(shell date +%Y%m%d%H%M%S)' -linkmode external -extldflags '-static'" ./main.go

test:
	$(GOTEST) -v ./...

clean:
	$(GOCLEAN)
	rm -f $(BIN_DIR)/*

lint:
	$(GOLINT) run

fmt:
	$(GOFMT) -w .

# Cross compilation
build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) $(BUILD_FLAGS) -o $(BIN_DIR)/$(BINARY_UNIX) -v ./...

# Static build with no glibc dependency
swagger-init:
	swag init -g router/main.go --output docs/

static-build: swagger-init
	CGO_ENABLED=0 $(GOBUILD) -trimpath $(BUILD_FLAGS) -o $(BIN_DIR)/$(BINARY_NAME) -a -ldflags '-X "github.com/53AI/53AIHub/config.VersionTime=$(shell date +%Y%m%d%H%M%S)" -extldflags "-static"' ./main.go

# 交叉编译 Windows 版本 (启用 CGO 支持 go-sqlite3)
WIN_OS := windows
WIN_BITS := 64
WIN_DATE := $(shell date +%Y%m%d%H%M)
WIN_OUTPUT := $(BIN_DIR)/$(BINARY_NAME)_$(WIN_OS)_$(WIN_BITS)_$(WIN_DATE).exe

LINUX_OS := linux
LINUX_BITS := 64
LINUX_DATE := $(shell date +%Y%m%d%H%M)
LINUX_OUTPUT := $(BIN_DIR)/$(BINARY_NAME)_$(LINUX_OS)_$(LINUX_BITS)_$(LINUX_DATE)

static-build-with-info: swagger-init
	GOMAXPROCS=1 CGO_ENABLED=0 $(GOBUILD) -trimpath $(BUILD_FLAGS) -o $(LINUX_OUTPUT) -a -ldflags '-X "github.com/53AI/53AIHub/config.VersionTime=$(LINUX_DATE)" -extldflags "-static"' ./main.go

build-windows-cgo:
	@echo "开始交叉编译 Windows 可执行文件 (启用 CGO)..."
	@if ! command -v x86_64-w64-mingw32-gcc > /dev/null; then \
		echo "请先安装 MinGW 交叉编译工具链: sudo apt-get install -y gcc-mingw-w64"; \
		exit 1; \
	fi
	CGO_ENABLED=1 GOOS=windows GOARCH=amd64 CC=x86_64-w64-mingw32-gcc CGO_LDFLAGS="-static -static-libgcc" $(GOBUILD) -trimpath $(BUILD_FLAGS) -o $(WIN_OUTPUT) -ldflags '-X "github.com/53AI/53AIHub/config.VersionTime=$(WIN_DATE)" -s -w' ./main.go
	@echo "Windows 可执行文件已生成: $(WIN_OUTPUT)"

# 静态编译 Windows 版本 (完全静态链接，启用 CGO)
build-windows-static-cgo:
	@echo "开始静态编译 Windows 可执行文件 (启用 CGO)..."
	@if ! command -v x86_64-w64-mingw32-gcc > /dev/null; then \
		echo "请先安装 MinGW 交叉编译工具链: sudo apt-get install -y gcc-mingw-w64"; \
		exit 1; \
	fi
	CGO_ENABLED=1 GOOS=windows GOARCH=amd64 CC=x86_64-w64-mingw32-gcc CGO_LDFLAGS="-static -static-libgcc -static-libstdc++" $(GOBUILD) -trimpath  $(BUILD_FLAGS) -o $(WIN_OUTPUT) -ldflags '-X "github.com/53AI/53AIHub/config.VersionTime=$(WIN_DATE)" -s -w -H=windowsgui' ./main.go
	@echo "Windows 静态可执行文件已生成: $(WIN_OUTPUT)"