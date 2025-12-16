package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/53AI/53AIHub/common/logger"
	"github.com/53AI/53AIHub/config"
	"github.com/53AI/53AIHub/model"
	tencent_sdk "github.com/53AI/53AIHub/service/hub_adaptor/tencent/sdk"
	"github.com/gin-gonic/gin"
	tcommon "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/profile"
)

// GetTencentAllApps Get all Tencent apps
// @Summary Get all Tencent apps
// @Description Get all Tencent apps list under current enterprise
// @Tags Tencent
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param provider_id query int false "Provider ID (optional, for backward compatibility)"
// @Success 200 {object} model.CommonResponse{data=[]tencent_sdk.AppInfo}
// @Router /api/tencent/apps [get]
func GetTencentAllApps(c *gin.Context) {
	eid := config.GetEID(c)
	providerID, _ := strconv.ParseInt(c.DefaultQuery("provider_id", "0"), 10, 64)
	provider, err := model.GetProviderByEidAndProviderTypeWithOptionalID(eid, int64(model.ProviderTypeTencent), providerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ProviderNoFoundError.ToResponse(err))
		return
	}

	// 从Configs中解析secretId, secretKey, region
	secretId, secretKey, region, err := parseTencentCredentials(provider.Configs)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ParamError.ToResponse(err))
		return
	}

	// 初始化腾讯云客户端
	client, err := initTencentClient(secretId, secretKey, region)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ProviderNoFoundError.ToResponse(err))
		return
	}

	// 循环调用ListApp接口获取所有应用列表
	var allApps []*tencent_sdk.AppInfo
	pageSize := uint64(100)
	pageNumber := uint64(1)

	for {
		request := tencent_sdk.NewListAppRequest()
		request.PageSize = tcommon.Uint64Ptr(pageSize)
		request.PageNumber = tcommon.Uint64Ptr(pageNumber)
		request.AppStatus = tcommon.StringPtr("2") // 只获取运行中的

		response, err := client.ListApp(request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, model.ProviderNoFoundError.ToResponse(err))
			return
		}

		// 添加当前页的应用到总列表
		allApps = append(allApps, response.Response.List...)

		// 检查是否还有更多页面
		total, _ := strconv.ParseUint(*response.Response.Total, 10, 64)
		if uint64(len(allApps)) >= total {
			break
		}

		pageNumber++
	}

	c.JSON(http.StatusOK, model.Success.ToResponse(allApps))
}

// GetTencentAppDetail Get Tencent app detail
// @Summary Get Tencent app detail
// @Description Get Tencent app detail by app ID
// @Tags Tencent
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param app_id path string true "App ID"
// @Param provider_id query int false "Provider ID (optional, for backward compatibility)"
// @Success 200 {object} model.CommonResponse{data=tencent_sdk.DescribeAppResponseParams}
// @Router /api/tencent/apps/{app_id} [get]
func GetTencentAppDetail(c *gin.Context) {
	appID := c.Param("app_id")
	if appID == "" {
		c.JSON(http.StatusBadRequest, model.ParamError.ToResponse(nil))
		return
	}

	eid := config.GetEID(c)
	providerID, _ := strconv.ParseInt(c.DefaultQuery("provider_id", "0"), 10, 64)
	provider, err := model.GetProviderByEidAndProviderTypeWithOptionalID(eid, int64(model.ProviderTypeTencent), providerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ProviderNoFoundError.ToResponse(err))
		return
	}

	// 从Configs中解析secretId, secretKey, region
	secretId, secretKey, region, err := parseTencentCredentials(provider.Configs)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ParamError.ToResponse(err))
		return
	}

	// 初始化腾讯云客户端
	client, err := initTencentClient(secretId, secretKey, region)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ProviderNoFoundError.ToResponse(err))
		return
	}

	// 调用DescribeApp接口获取应用详情
	request := tencent_sdk.NewDescribeAppRequest()
	request.AppBizId = &appID
	response, err := client.DescribeApp(request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ProviderNoFoundError.ToResponse(err))
		return
	}
	// 同步更新或创建Channel
	err = UpdateTencentChannel(client, provider, response.Response)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ProviderNoFoundError.ToResponse(err))
		return
	}
	c.JSON(http.StatusOK, model.Success.ToResponse(response.Response))
}

func UpdateTencentChannel(client *tencent_sdk.Client, provider model.Provider, response *tencent_sdk.DescribeAppResponseParams) error {
	// 检查response和AppBizId是否为nil
	if response == nil || response.AppBizId == nil {
		err := fmt.Errorf("received nil response or AppBizId from Tencent API")
		logger.SysError("Failed to get valid response from Tencent API: " + err.Error())
		return err
	}

	modelName := "bot-" + *response.AppBizId
	var channel *model.Channel
	err := model.DB.Where("eid = ? and provider_id = ? and models = ?", provider.Eid, provider.ProviderID, modelName).First(&channel).Error
	if err != nil || channel == nil {
		// 创建新的Channel
		channel = &model.Channel{
			Eid:        provider.Eid,
			ProviderID: provider.ProviderID,
			Type:       model.ChannelApiTypeTencent,
			Models:     modelName,
			Name:       modelName,
			BaseURL:    provider.BaseURL,
			Status:     model.ChannelStatusEnabled,
		}
	}
	// 获取token 更新并保存
	request := tencent_sdk.NewGetAppSecretRequest()
	request.AppBizId = response.AppBizId
	secretResponse, err := client.GetAppSecret(request)
	if err != nil {
		logger.SysError("Failed to get Tencent app secret: " + err.Error())
		return err
	}

	// 检查AppKey是否为nil
	if secretResponse.Response == nil || secretResponse.Response.AppKey == nil {
		err := fmt.Errorf("received nil AppKey from Tencent API")
		logger.SysError("Failed to get valid AppKey from Tencent response: " + err.Error())
		return err
	}

	channel.Key = *secretResponse.Response.AppKey

	// 更新Channel
	err = model.DB.Save(channel).Error
	if err != nil {
		logger.SysError("Failed to save Tencent channel: " + err.Error())
		return err
	}

	return nil
}

// parseTencentCredentials 从Configs中解析腾讯云凭证信息
func parseTencentCredentials(configs string) (secretId, secretKey, region string, err error) {
	// 定义腾讯云配置结构
	type TencentConfig struct {
		SecretID  string `json:"secret_id"`
		SecretKey string `json:"secret_key"`
		Region    string `json:"region"`
	}

	var config TencentConfig
	if err = json.Unmarshal([]byte(configs), &config); err != nil {
		// 如果JSON解析失败，尝试使用旧的AccessToken格式作为备选方案
		parts := strings.Split(configs, ":")
		if len(parts) != 3 {
			err = fmt.Errorf("invalid tencent config format, expected JSON with 'secret_id', 'secret_key', and 'region' fields")
			return
		}
		secretId = parts[0]
		secretKey = parts[1]
		region = parts[2]
		return
	}

	// 检查必要字段
	if config.SecretID == "" || config.SecretKey == "" || config.Region == "" {
		err = fmt.Errorf("tencent config missing required fields: secret_id, secret_key, or region")
		return
	}

	secretId = config.SecretID
	secretKey = config.SecretKey
	region = config.Region
	return
}

// initTencentClient 初始化腾讯云客户端
func initTencentClient(secretId, secretKey, region string) (*tencent_sdk.Client, error) {
	credential := tcommon.NewCredential(secretId, secretKey)
	cpf := profile.NewClientProfile()
	client, err := tencent_sdk.NewClient(credential, region, cpf)
	if err != nil {
		logger.SysError("Failed to initialize Tencent client: " + err.Error())
		return nil, err
	}
	return client, nil
}
