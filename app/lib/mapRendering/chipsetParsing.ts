import { XMLParser } from "fast-xml-parser";
import {readFile} from "node:fs/promises";
import {GameDBChipSet, TilePassability} from "@/scripts/databaseSeeding/types";
import {ChipSet} from "@/app/lib/mapRendering/types";

// This is outdated, remember to change

export async function processChipsetData(filepath: string): Promise<Map<number, ChipSet>> {
    const databaseXml = await readFile(filepath, "utf8");

    const parser = new XMLParser();
    const database = parser.parse(databaseXml);

    const chipsets = new Map<number, ChipSet>
    database.LDB.Database.chipsets.Chipset.forEach((chipset: GameDBChipSet, id: number) => {
        if (chipset.chipset_name !== "") {
            chipsets.set(id, {
                filename: chipset.chipset_name,
                passability: parsePassability(chipset.passable_data_lower, chipset.passable_data_upper),
            });
        }
    });

    return chipsets;
}

function parsePassability(passableDataLower: string, passableDataUpper: string): {
    lower: TilePassability[];
    upper: TilePassability[];
} {
    const tilesLower: TilePassability[] = [];
    const tilesUpper: TilePassability[] = [];

    const lowerPassability = passableDataLower.trim().split(/\s+/).map(Number)
    const upperPassability = passableDataUpper.trim().split(/\s+/).map(Number)

    lowerPassability.forEach((value: number) => {
        tilesLower.push({
            down: !(value & 0b0001),
            left: !(value & 0b0010),
            right: !(value & 0b0100),
            up: !(value & 0b1000),
        });
    });

    upperPassability.forEach((value: number) => {
        tilesUpper.push({
            down: !(value & 0b0001),
            left: !(value & 0b0010),
            right: !(value & 0b0100),
            up: !(value & 0b1000),
        });
    });

    return {lower: tilesLower, upper: tilesUpper}
}
