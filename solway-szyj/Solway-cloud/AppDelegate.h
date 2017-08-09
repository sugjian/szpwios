//
//  AppDelegate.h
//  HaiGouWang
//
//  Created by huangzengsong on 15/2/28.
//  Copyright (c) 2015年 huangzengsong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "GeTuiSdk.h"
#import "WebViewJavascriptBridge.h"

#define kGtAppId           @"RCdvLfbOgW8axkLXakKW87"
#define kGtAppKey          @"9I7rUsSCd4A5qdzrhLOnN5"
#define kGtAppSecret       @"N4IMiCQM5D6soEDLsXHuF"

@interface AppDelegate : UIResponder <UIApplicationDelegate,UIAlertViewDelegate>{
//    NSString *trackViewUrl;
}

//@property (nonatomic,retain) NSString *trackViewUrl;

@property (strong, nonatomic) UIWindow *window;
@property WebViewJavascriptBridge* bridge;

@end

