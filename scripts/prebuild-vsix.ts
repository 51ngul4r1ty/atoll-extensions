import * as fs from "fs";

const dir = "./dist-vsix/";
const folderExists = fs.existsSync(dir);
if (folderExists) {
    console.log(`removing folder "${dir}" (and all contents)...`);
    fs.rmdirSync(dir, {
        recursive: true
    });
}
console.log(`creating folder "${dir}"...`);
fs.mkdirSync(dir, {
    recursive: true
});
console.log(`created folder "${dir}"`);
console.log();
