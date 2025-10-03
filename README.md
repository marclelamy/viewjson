# View json

![JSON Preview Screenshot](https://oh28wvg0kw.ufs.sh/f/Uq9yFdNAkVnxJZEqkWOoQ2PD48E517OZeNmAIdfgXpj6cnJh)

A beautiful, client-side JSON visualizer that transforms your JSON data into an interactive node graph. Made with [React Flow](https://reactflow.dev/) <3

## Why we built this
- **No size limits** - The limit of how big the JSON can be is your computer starting to catch fire
- **100% client-side** - legend says the app doesn't even run on a server
- **Actually free** - No account, no paywalls, no upscale cloud BS

## Features
- Interactive node-based graph visualization
- Supports large JSON files without restrictions
- Repair broken json
- No data ever leaves your browser

## Todo
- [x] Implement JSON repair 
- [ ] Should allow for stringify json as well as non parsed json copied from the terminal 
    - [ ] The [OBJECT] should just be treated as a string
- [ ] Add a button to copy the json to the clipboard
- [ ] Add a dialog/sheet on click of a node 
    - [ ] Add the path of the node
- [ ] Add a tree view 
- [ ] Add import/export buttons