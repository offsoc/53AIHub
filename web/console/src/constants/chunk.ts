export const CHUNK_SETTING_DEFAULT = {
  id: 0,
  eid: 0,
  library_id: null,
  file_id: null,
  chunking_config: {
    version: '1.0',
    knowledge_chunking: {
      split_rule: 'h2',
      max_length: 2000,
      overlap_size: 0,
      include_title: false,
      include_filename: false,
      chunk_mode: '',
    },
    index_chunking: {
      split_rule: 'h2',
      max_length: 2000,
      overlap_size: 0,
      include_title: false,
      include_filename: false,
      chunk_mode: '',
    },
    content_summary: {
      generation_method: 'manual',
    },
    common_questions: {
      generation_method: 'manual',
    },
  },
  created_time: 0,
  updated_time: 0,
}
