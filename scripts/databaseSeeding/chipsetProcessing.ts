import { XMLParser } from "fast-xml-parser";
import {readFile} from "node:fs/promises";
import type {AppDBChipSet, GameDBChipSet} from "./types";

export async function processChipsetData(filepath: string): Promise<Map<number, AppDBChipSet>> {
    console.log("Processing Chipset Data...")
    const databaseXml = await readFile(filepath, "utf8");

    const parser = new XMLParser();
    const database = parser.parse(databaseXml);

    const chipsets = new Map<number, AppDBChipSet>
    database.LDB.Database.chipsets.Chipset.forEach((chipset: GameDBChipSet, id: number) => {
        if (chipset.chipset_name !== "") {
            chipsets.set(id, {
                imageKey: String(chipset.chipset_name),
                upperPassibility: chipset.passable_data_upper.trim().split(/\s+/).map(Number),
                lowerPassibility: chipset.passable_data_lower.trim().split(/\s+/).map(Number),
            });
        }
    });

    console.log("Finished processing Chipset Data");
    return chipsets;
}