import os from "os"
import path from "path"
import fs from "fs/promises"
import yaml from "js-yaml"
import msiKeyboard from "msi-keyboard"

const configPath = path.join(os.homedir(), ".msi-backlight-modes.yml")

const defaultConfig = {
    modes: [
        { id: "default", colors: { left: "red", middle: "red", right: "red" } },
        { id: "gaming", colors: { left: "blue", middle: "green", right: "red" } },
        { id: "off", colors: { left: "black", middle: "black", right: "black" } }
    ]
}

async function isConfigFileExists() {
    return fs.access(configPath)
        .then(() => true)
        .catch(() => false);
}

async function createDefaultConfigFile() {
    await fs.writeFile(configPath, yaml.dump(defaultConfig))
}

function getIdFromCli() {
    return process.argv.at(-1).trim();
}

async function getModes() {
    const data = await fs.readFile(configPath);
    const config = yaml.load(data);
    return config["modes"];
} 

async function main() {
    const isFirstRun = !(await isConfigFileExists());
    if (isFirstRun) {
        console.log("Thanks for installing `msi-backlight-modes`.");
        await createDefaultConfigFile();
    }

    const modes = await getModes();
    const id = getIdFromCli();

    const mode = modes.filter(mode => mode.id === id)[0];
    if (!mode) {
        throw new Error("No mod with the given id is found!")
    }

    const keyboard = msiKeyboard();
    Object.entries(mode["colors"]).forEach(([key, value]) =>
        keyboard.color(key, value)
    );

    console.log(`Mode(${id}) successfully set.`)
}

main().catch(error => console.error(error.message ?? error));