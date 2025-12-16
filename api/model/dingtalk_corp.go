package model

import (
	"encoding/json"
	"errors"

	"gorm.io/gorm"
)

type DingtalkCorp struct {
	CorpId          string `json:"corpid" gorm:"primaryKey;type:varchar(64)"`
	SuiteId         string `json:"suiteid" gorm:"type:varchar(32);index;not null"`
	CorpName        string `json:"corp_name" gorm:"type:varchar(255);not null"`
	IndustryCode    string `json:"industry_code" gorm:"type:varchar(50)"`
	AccessToken     string `json:"access_token" gorm:"type:varchar(255)"`
	ExpiresIn       int    `json:"expires_in" gorm:"type:int"`
	PermanentCode   string `json:"permanent_code" gorm:"type:varchar(255)"`
	TokenUpdateTime int64  `json:"token_update_time" gorm:"type:bigint"`
	LogoUrl         string `json:"logo_url" gorm:"type:varchar(1000)"`
	Scale           int    `json:"scale" gorm:"type:int"`
	AuthUserId      string `json:"auth_user_id" gorm:"type:varchar(255)"`
	Status          int    `json:"status" gorm:"type:int;default:0"`
	AuthInfo        string `json:"auth_info" gorm:"type:text"`
	AuthUserInfo    string `json:"auth_user_info" gorm:"type:text"`
	AgentId         int    `json:"agentid" gorm:"type:int"`
	// 根据钉钉授权事件文档新增字段
	IsAuthenticated bool `json:"is_authenticated" gorm:"type:bool"` // 企业是否认证
	BaseModel
}

type DingtalkAuthCorpInfo struct {
	CorpId       string `json:"corpid"`
	CorpName     string `json:"corp_name"`
	IndustryCode string `json:"industry_code"`
	LogoUrl      string `json:"logo_url"`
	Scale        int    `json:"scale"`
	SuiteId      string `json:"suite_id"`
}

type DingtalkAuthUserInfo struct {
	UserId string `json:"user_id"`
}

type AuthInfo struct {
	IsAuth bool `json:"isAuth"`
	Agent  []struct {
		AgentId   int    `json:"agentId"`
		AppName   string `json:"appName"`
		AppLogo   string `json:"appLogo"`
		IsAuth    bool   `json:"isAuth"`
		Permanent bool   `json:"permanent"`
	} `json:"agent"`
}

func GetDingtalkCorp(suiteId string, corpId string) (*DingtalkCorp, error) {
	if corpId == "" {
		return nil, errors.New("corp_id is empty")
	}
	model := &DingtalkCorp{}
	err := DB.Where("suite_id = ? AND corp_id = ?", suiteId, corpId).First(model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return model, nil
}

func CreateDingtalkCorp(corp *DingtalkCorp) error {
	err := DB.Create(corp).Error
	if err != nil {
		return err
	}
	return nil
}

func UpdateDingtalkCorp(corp *DingtalkCorp) error {
	err := DB.Save(corp).Error
	if err != nil {
		return err
	}
	return nil
}

func (d *DingtalkCorp) GetAuthUserInfo() *DingtalkAuthUserInfo {
	var authInfo DingtalkAuthUserInfo
	if err := json.Unmarshal([]byte(d.AuthUserInfo), &authInfo); err != nil {
		return nil
	}
	return &authInfo
}

func (d *DingtalkCorp) Update() error {
	return DB.Save(d).Error
}

func (d *DingtalkCorp) Delete() error {
	return DB.Delete(d).Error
}

func (d *DingtalkCorp) GetAuthCorpInfo() *DingtalkAuthCorpInfo {
	var authCorpInfo DingtalkAuthCorpInfo
	if err := json.Unmarshal([]byte(d.AuthInfo), &authCorpInfo); err != nil {
		return nil
	}
	if authCorpInfo.CorpId == "" {
		authCorpInfo.CorpId = d.CorpId
	}
	if authCorpInfo.CorpName == "" {
		authCorpInfo.CorpName = d.CorpName
	}
	if authCorpInfo.IndustryCode == "" {
		authCorpInfo.IndustryCode = d.IndustryCode
	}
	if authCorpInfo.LogoUrl == "" {
		authCorpInfo.LogoUrl = d.LogoUrl
	}
	if authCorpInfo.Scale == 0 {
		authCorpInfo.Scale = d.Scale
	}
	if authCorpInfo.SuiteId == "" {
		authCorpInfo.SuiteId = d.SuiteId
	}
	return &authCorpInfo
}
