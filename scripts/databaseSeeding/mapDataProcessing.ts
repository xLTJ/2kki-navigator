import * as fs from "node:fs";
import {readFile} from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import type { GameDBMapData } from "./types";

export async function processMapData(filepath: string) {
    console.log("Processing Chipset Data...")
    const parser = new XMLParser();

    for (const filename of fs.readdirSync(filepath)) {
        const mapDataXml = await readFile(`${filepath}/${filename}`, "utf8");
        const mapData: GameDBMapData = parser.parse(mapDataXml);
    }
}