## publish
version=1.0.0
1. update .github/workflows/release.yml
```
  - os: ${os}
    artifact-version: "xxx"
    artifact-name: "xxx"
```

2. update package.json
version="${version}"

3. git tag v${version}

4. git push origin tag v${version}

## 启动流程
1. 配置写入硬盘setting.lastChoosed，并更新内存中的setting
2. 启动Europa
3. 创建新Api, 销毁老Api
4. 监听connected$