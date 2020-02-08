## Setup

Clone the repo

```sh
git clone https://github.com/mycql/yapv.git
cd yapv
npm install
```
Then you can either run:
```sh
npm run build
```
to build YAPV once or
```sh
npm run serve
```
to have YAPV build itself and incrementally build and watch files on change (a.k.a devmode).

You can access the built files for individual packages from packages/*[package-name]*/lib.

### Running on devmode
If you're on devmode, you can view sample renders by visiting:

http://localhost:3000/examples/plain/index.html - View some sample files <br/>
http://localhost:3000/examples/editor/index.html - View the data in an editor which you can iteratively modify and see the view in real time
