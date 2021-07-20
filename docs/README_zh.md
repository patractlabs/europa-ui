# Europa-UI
[English](https://github.com/patractlabs/europa-ui/blob/main/README.md)

本项目为[Europa](https://github.com/patractlabs/europa)关联项目。目标是利用[patractlab](https://github.com/patractlabs)的工具（例如*Europa*和[*redspot*](https://github.com/patractlabs/redspot) ）构建跨平台桌面应用，以此简化开发及测试智能合约。它基于[Electron](https://www.electronjs.org/)构建，内嵌了Europa节点程序。因此，它做到了开箱即用，不需要提前配置环境。
# Features
1. **Contracts**  
    + 展示合约列表
    + 关联本地Redspot项目的合约
    + 解析合约
    + 部署合约及调用合约方法

2. **Explorer**  
    + 展示所有区块及相关交易
    + 向前及向后跳转到任意区块高度

3. **Accounts**  
    + 管理账号

4. **Blocks**  
    + 展示区块列表
    + 展示区块详情

5. **Extrinsics**  
    + 展示交易列表
    + 展示交易详情，对于合约调用相关交易，还包含充分的调用栈信息
    + 展示交易相关事件及该交易所改变的状态

6. **Events**  
    + 展示事件列表
    + 展示事件详情

7. **Developer**  
    + 链状态
    + 交易
    + RPC调用
    + Europa节点日志

8. **Others**  
    + 更改Europa节点启动参数
    + 关联Redspot项目路径

# Support Platforms
二进制程序点击即可运行（Linux平台需要给予可执行权限）。现在我们支持以下平台：
+ windows 10 21H1 and above
+ macOS 10.15.7 and above
+ Ubuntu 20.04 and above
> *macOS不支持M1系列CPU, 但可以尝试使用Rosetta来运行二进制包。对于Ubuntu，我们只保证20.04以上版本可用。由于glibc兼容问题，18.04及以下版本无法运行该软件。*

# Download
所有发布版可以在[GITHUB发布页面](https://github.com/patractlabs/europa-ui/releases)找到。推荐下载最新发布版。

# Development
``` 
// install dependencies
yarn

// open dev frontend server
yarn start

// open dev electron application
yarn start:electron
```

# Build
```
// 构建Windows未打包版本
pack:win:dir

// 构建Windows NSIS版安装包
pack:win

// 构建macOS未打包版本
pack:mac:dir

// 构建macOS打包应用 [dmg]
pack:mac

// 构建Linux未打包版本
pack:linux:dir

// 构建linux打包应用 [AppImage]
pack:linux
```