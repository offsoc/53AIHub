package controller

import (
	"net/http"

	"github.com/53AI/53AIHub/model"
	"github.com/gin-gonic/gin"
)

// SyncOrganization 处理组织同步请求（开源版本）
// @Summary Sync organization structure
// @Description Synchronize enterprise organization structure based on source
// @Tags Department
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param from path int true "Source identifier (1=WeCom, 2=DingTalk)"
// @Param body body interface{} true "Sync parameters"
// @Success 200 {object} model.CommonResponse "Operation succeeded"
// @Failure 400 {object} model.CommonResponse "Parameter error"
// @Failure 500 {object} model.CommonResponse "Server error"
// @Router /api/departments/sync/{from} [post]
func SyncOrganization(c *gin.Context) {
	// 开源版本不支持组织同步功能
	c.JSON(http.StatusForbidden, model.ForbiddenError.ToResponse("organization sync feature not available in oss version"))
}

// GetSyncProgress 获取同步进度（开源版本）
// @Summary Get sync progress
// @Description Get synchronization progress
// @Tags Synchronization
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param from path int true "Source: 1=WeCom, 2=DingTalk"
// @Success 200 {object} model.CommonResponse{data=interface{}} "Operation succeeded"
// @Failure 400 {object} model.CommonResponse "Parameter error"
// @Failure 404 {object} model.CommonResponse "Enterprise not found"
// @Router /api/sync-progress/{from} [get]
func GetSyncProgress(c *gin.Context) {
	// 开源版本不支持组织同步功能
	c.JSON(http.StatusForbidden, model.ForbiddenError.ToResponse("organization sync feature not available in oss version"))
}

// GetAllSyncProgress 获取所有同步进度（开源版本）
// @Summary Get all sync progress
// @Description Get all synchronization progress
// @Tags SyncProgress
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} model.CommonResponse{data=map[string]interface{}} "Operation succeeded"
// @Router /api/sync-progress [get]
func GetAllSyncProgress(c *gin.Context) {
	// 开源版本不支持组织同步功能
	c.JSON(http.StatusForbidden, model.ForbiddenError.ToResponse("organization sync feature not available in oss version"))
}

// GetSyncProgressByFrom 根据来源获取同步进度（开源版本）
// @Summary Get sync progress by source
// @Description Get synchronization progress by source type
// @Tags SyncProgress
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param from path int true "Source identifier (1=WeCom, 2=DingTalk)"
// @Success 200 {object} model.CommonResponse{data=map[int64]interface{}} "Operation succeeded"
// @Failure 400 {object} model.CommonResponse "Parameter error"
// @Router /api/sync-progress/{from}/all [get]
func GetSyncProgressByFrom(c *gin.Context) {
	// 开源版本不支持组织同步功能
	c.JSON(http.StatusForbidden, model.ForbiddenError.ToResponse("organization sync feature not available in oss version"))
}
