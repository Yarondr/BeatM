import * as fs from 'fs';
import path from 'path';

export function getFiles(path: string, ending: string): string[] {
    return fs.readdirSync(path).filter(file => file.endsWith(ending));
}

export function hasFolders(folderPath: string): boolean {
    return fs.readdirSync(folderPath).filter(file => fs.lstatSync(path.join(folderPath, file)).isDirectory()).length > 0;
}