declare namespace User {
  interface Info {
    access_token: string
    user_id: string
    username: string
    nickname: string
    avatar: string
    email: string
    eid: number
    role: number
    group_id: number
    group_ids: number[]
    group_name: string
    group_icon: string
    group_expire_time: string
    group_expire_day: number
    group_isexpired: boolean
    mobile: string
    openid: string
    is_internal: boolean
  }

  interface LoginForm {
    username: string
    password: string
  }

  interface SmsLoginForm {
    mobile: string
    verify_code: string
  }

  interface BindWechatForm {
    mobile?: string
    verify_code?: string
    openid: string
    unionid?: string
    nickname?: string
  }

  interface RegisterForm {
    username: string
    password: string
    nickname?: string
    verify_code?: string
  }

  interface ResetPasswordForm {
    email?: string
    mobile?: string
    verify_code: string
    confirm_password: string
    new_password: string
  }

  interface ChangeMobileForm {
    new_mobile: string
    old_code?: string
    new_code: string
  }

  interface SsoLoginParam {
    sign: string
    timestamp: string
    username: string
  }
}
