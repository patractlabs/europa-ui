## publish

1. update **europa_version** in _.github/workflows/release.yml_

```yml
- name: Download release artifact
  with:
    owner: patractlabs
    repo: europa
    tag: ${europa_version}
```

2. update package.json

```JSON
version="${version}"
```

3. git tag v${version}

4. git push origin tag v${version}
