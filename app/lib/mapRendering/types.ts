import {TilePassability} from "@/scripts/databaseSeeding/types";

export interface ChipSet {
    filename: string;
    passability: {
        lower: TilePassability[];
        upper: TilePassability[];
    };
}