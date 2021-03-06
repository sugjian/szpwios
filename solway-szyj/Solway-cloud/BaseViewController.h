//
//  BaseViewController.h
//  HaiGouWang
//
//  Created by huangzengsong on 15/3/1.
//  Copyright (c) 2015年 huangzengsong. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "WebViewJavascriptBridge.h"


@interface BaseViewController : UIViewController<UIWebViewDelegate,UIGestureRecognizerDelegate> {
    @public UIWebView *_webView;
}
@property(nonatomic,strong)UIImageView *navBgImageView;
@property WebViewJavascriptBridge* bridge;

@property (strong, nonatomic) NSString *oldVersion;


@end
