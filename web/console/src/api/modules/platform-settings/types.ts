export interface RawPlatformSetting {
  created_time: number
  eid: string
  id: string
  platform_key: string
  setting: string
  updated_time: number
}

export interface PlatformSetting extends Omit<RawPlatformSetting, 'setting'> {
  setting: Record<string, any>
}
