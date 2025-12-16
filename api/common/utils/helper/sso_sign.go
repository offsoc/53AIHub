package helper

import (
	"crypto/md5"
	"fmt"
)

// BuildSSORawString 构造原始签名串：timestamp={10位}&username={规范化用户名}{secret}
func BuildSSORawString(timestamp string, normalizedUsername string, secret string) string {
	return fmt.Sprintf("timestamp=%s&username=%s%s", timestamp, normalizedUsername, secret)
}

// CalcSSOSignLowerHex 计算 MD5 并返回小写十六进制字符串（UTF-8）
func CalcSSOSignLowerHex(raw string) string {
	sum := md5.Sum([]byte(raw))
	return fmt.Sprintf("%x", sum)
}
