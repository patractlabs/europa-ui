# Europa-UI
This project is related to [Europa](https://github.com/patractlabs/europa). It aims to build a desktop application which make use of [patractlab](https://github.com/patractlabs) tools like *Europa* and *[redspot](https://github.com/patractlabs/redspot)* to simplify developing and testing smart contracts . It's built on [Electron](https://www.electronjs.org/), and the Europa node is embedded. Therefore, it's out of box, no environments setting are required.

# Features
1. **Contracts**  
Listing and decoding contracts including local redpost project's artifacts, deploying contracts, call contract functions with more features than [apps](https://polkadot.js.org/apps/).

2. **Explorer**  
Listing all blocks including related extrinsics in one page.

3. **Accounts**  
Managing accounts.

4. **Blocks**  
Listing blocks and showing block detail.

5. **Extrinsics**  
Listing extrinsics, showing extrinsic detail. we spent a lot of effort to make contract-call extrinsic's details sufficient thorough.

6. **Events**  
Listing events and showing event details.

7. **Developer**  
Support chain state, extrinsic, Rpc calls and the   Europa node's log.

8. **Others**  
Changing database directory，workspace，HTTP port, Websocket Port and adding redspot projects association.

# Support Platforms
The binary file can be run after clicking it (Linux needs to be given execution permission). Currently, we support these platforms below:
+ windows 10 21H1 and above
+ macOS 10.15.7 and above
+ Ubuntu 20.04 and above
> *macOS does not support M1, but you can try to use Rosetta to run the binary package of macOS, but we do not guarantee all compatibility. For Ubuntu, we only guarantee the normal operation of Ubuntu 20.04 and above. Ubuntu 18.04 and below versions cannot run due to the compatibility of glibc.*
# Download
All released applications will be found at [GITHUB relase page](https://github.com/patractlabs/europa-ui/releases), just download the latest release.
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
// build unpackaged Windows version
pack:win:dir

// build Windows nsis install application
pack:win

// build unpackaged Macos version
pack:mac:dir

// build packaged Macos application. [dmg]
pack:mac

// build unpackaged Linux version
pack:linux:dir

// build packaged Linux application. [AppImage]
pack:linux
```