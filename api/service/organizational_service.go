package service

import (
	"errors"
	"fmt"
	"strings"

	"github.com/53AI/53AIHub/config"
	"github.com/53AI/53AIHub/model"
)

type SyncOrganizationParams struct {
	// suite_id dingtalk无效，取系统配置的SuiteID
	SuiteID string `json:"suite_id"`
}

type OrganizationUserListParams struct {
	EID        int64  `form:"-"`
	From       int    `form:"from"`
	Status     int    `form:"status" default:"-1"`
	Offset     int    `form:"offset" default:"0"`
	Limit      int    `form:"limit" default:"10"`
	Keyword    string `form:"keyword"`
	UserStatus int    `form:"user_status" default:"-1"`
	DID        int64  `form:"did"`
}

type OrganizationUserDataTemp struct {
	model.MemberBinding
	UserUserID          int64                                `gorm:"column:user_id" json:"user_id"`
	Username            string                               `gorm:"column:username" json:"username"`
	Nickname            string                               `gorm:"column:nickname" json:"nickname"`
	Avatar              string                               `gorm:"column:avatar" json:"avatar"`
	Mobile              string                               `gorm:"column:mobile" json:"mobile"`
	Email               string                               `gorm:"column:email" json:"email"`
	Role                int64                                `gorm:"column:role" json:"role"`
	UserStatus          int                                  `gorm:"column:user_status" json:"user_status"`
	DepartmentRelations []*OrganizationDepartmentRelationRes `gorm:"-" json:"department_relations"`
}

type OrganizationUserListResponse struct {
	TotalCount int64                       `json:"total_count"`
	Data       []*OrganizationUserDataTemp `json:"data"`
}

type OrganizationDepartmentRelationRes struct {
	model.MemberDepartmentRelation
	BindValue string `json:"bind_value" gorm:"column:bindvalue"`
	Name      string `json:"name"`
	PDID      int64  `json:"pid"`
	Path      string `json:"path"`
	Sort      int    `json:"sort"`
}

func WeComRunSyncOrganization(e *model.Enterprise, params SyncOrganizationParams) error {
	if config.IS_SAAS {
		wc, err := model.GetWecomCorp(params.SuiteID, e.WecomCorpID)
		if err != nil {
			return err
		}
		if wc == nil {
			return errors.New("wecom corp not found")
		}
		return nil
	} else {
		return nil
	}
}

func DingtalkRunSyncOrganization(e *model.Enterprise, params SyncOrganizationParams) error {
	if config.IS_SAAS {
		dc, err := model.GetDingtalkCorp(params.SuiteID, e.DingtalkCorpID)
		if err != nil {
			return err
		}
		if dc == nil {
			return errors.New("dingtalk corp not found")
		}
		return nil
	} else {
		return nil
	}
}

func InitFromBackendMemberBinding(eid int64) error {
	// init from backend member binding
	var users []*model.User
	err := model.DB.Model(&model.User{}).
		Where("type = ? AND eid = ?", model.UserTypeInternal, eid).Find(&users).Error
	if err != nil {
		return err
	}

	if len(users) == 0 {
		return nil
	}

	var UserIDs []int64
	for _, u := range users {
		UserIDs = append(UserIDs, u.UserID)
	}

	var bindings []*model.MemberBinding
	err = model.DB.Model(&model.MemberBinding{}).Where("eid = ? AND `from` = ? AND mid IN?", eid, model.DepartmentFromBackend, UserIDs).Find(&bindings).Error
	if err != nil {
		return err
	}

	tx := model.DB.Begin()
	diff := make([]int64, 0)
	for _, mid := range UserIDs {
		found := false
		for _, binding := range bindings {
			if mid == binding.MID {
				found = true
				break
			}
		}
		if !found {
			diff = append(diff, mid)
		}
	}

	for _, mid := range diff {
		memberBinding := &model.MemberBinding{
			EID:       eid,
			MID:       mid,
			BindValue: fmt.Sprintf("%d", mid),
			From:      model.DepartmentFromBackend,
			Status:    model.DepartmentStatusNormal,
		}

		memberBinding.Name = fmt.Sprintf("%d", mid)
		if err := tx.Create(memberBinding).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	tx.Commit()

	return nil
}

func GetOrganizationalUserList(params OrganizationUserListParams) (*OrganizationUserListResponse, error) {
	params.Keyword = strings.TrimSpace(params.Keyword)
	query := model.DB.Model(&model.MemberBinding{}).
		Where("member_bindings.eid = ? AND member_bindings.`from` = ?", params.EID, params.From)

	query.Select(`
    member_bindings.*,
    users.user_id as user_id,
    users.username,
    users.nickname,
    users.avatar,
    users.mobile,
    users.email,
    users.role,
    users.status as user_status
`)
	query.Joins("LEFT JOIN users ON users.user_id = member_bindings.mid AND users.eid = member_bindings.eid")
	if params.Keyword != "" {
		query.Where("users.nickname LIKE? OR users.mobile LIKE? OR users.email LIKE? OR member_bindings.bindvalue LIKE?",
			"%"+params.Keyword+"%", "%"+params.Keyword+"%", "%"+params.Keyword+"%", "%"+params.Keyword+"%")
	}

	if params.DID != 0 {
		query.Joins("LEFT JOIN member_department_relations ON member_department_relations.bid = member_bindings.id AND member_department_relations.`from` = member_bindings.`from` AND member_department_relations.eid = member_bindings.eid")
		query.Where("member_department_relations.did =?", params.DID)
	}
	if params.UserStatus != -1 {
		query.Where("users.status =?", params.UserStatus)
	}
	if params.Status != -1 {
		query.Where("member_bindings.status =?", params.Status)
	}

	count := int64(0)
	if err := query.Count(&count).Error; err != nil {
		return nil, err
	}

	var itemTmp []*OrganizationUserDataTemp
	res := &OrganizationUserListResponse{
		TotalCount: count,
		Data:       itemTmp,
	}
	if count == 0 {
		return res, nil
	}

	err := query.Debug().Offset(params.Offset).
		Limit(params.Limit).Order("member_bindings.updated_time desc").
		Find(&itemTmp).Error

	if err != nil {
		return nil, err
	}
	res.Data = itemTmp

	res.LoadDepartmentRelations()
	return res, nil
}

func (o *OrganizationUserListResponse) LoadDepartmentRelations() error {
	var eid int64
	bindIDs := make([]int64, 0)
	intFrom := false
	var from int
	for _, item := range o.Data {
		if eid == 0 {
			eid = item.EID
		}
		if !intFrom {
			from = item.From
			intFrom = true
		}
		bindIDs = append(bindIDs, item.ID)
	}

	var relations []*OrganizationDepartmentRelationRes
	err := model.DB.Model(&model.MemberDepartmentRelation{}).
		Select("member_department_relations.*, departments.bindvalue, departments.pdid, departments.name, departments.sort, departments.path").
		Joins("Left Join departments ON departments.did = member_department_relations.did AND departments.eid = member_department_relations.eid AND departments.`from` = member_department_relations.`from`").
		Where("member_department_relations.eid=? AND member_department_relations.bid IN?", eid, bindIDs).
		Where("member_department_relations.`from` =?", from).
		Find(&relations).Error

	if err != nil {
		return err
	}

	relationMap := make(map[int64][]*OrganizationDepartmentRelationRes)
	for _, relation := range relations {
		relationMap[relation.BID] = append(relationMap[relation.BID], relation)
	}

	for _, item := range o.Data {
		item.DepartmentRelations = relationMap[item.ID]
	}

	return nil
}
