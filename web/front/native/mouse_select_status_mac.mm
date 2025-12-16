#import <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>
#import <napi.h>

Napi::Value GetMouseSelectStatus(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    @autoreleasepool {
        NSCursor *currentCursor = [NSCursor currentSystemCursor];
        if ([currentCursor isEqual:[NSCursor IBeamCursor]]) {
            return Napi::Number::New(env, 1);
        }
    }

    return Napi::Number::New(env, 0);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getMouseSelectStatus"), Napi::Function::New(env, GetMouseSelectStatus));
    return exports;
}

NODE_API_MODULE(mouse_select_status, Init)
