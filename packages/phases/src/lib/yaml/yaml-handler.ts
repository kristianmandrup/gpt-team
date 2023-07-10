import * as fs from 'fs';
import * as yaml from 'js-yaml';

export const loadYamlFile = async (filePath: string) => {
  try {
    const file = fs.readFileSync(filePath, 'utf8');
    return yaml.load(file);
  } catch (e) {
    console.log(e);
    return;
  }
};

