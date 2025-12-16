{
  "targets": [

    {
      "target_name": "mouse_select_status",
      "sources": [ "mouse_select_status_win.cpp" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    },
    {
      "target_name": "mouse_select_status",
      "sources": [ "mouse_select_status_mac.mm" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_ENABLE_OBJC_ARC": "YES",
        "OTHER_CFLAGS": [
          "-ObjC++"
        ]
      },
      "link_settings": {
        "libraries": [
          "$(SDKROOT)/System/Library/Frameworks/Cocoa.framework"
        ]
      }
    }
  ]
}
