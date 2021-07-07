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