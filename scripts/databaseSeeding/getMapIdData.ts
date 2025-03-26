// Not in use, getting this data together with the world data in getWorldData.ts now.
// Keeping this file for a bit just in case i need something here for somee reason

import wtf from "wtf_wikipedia";

interface MapIdDataResponse {
    bachcomplete: string;
    warnings: object;
    query: {
        normalized: object[];
        pages: Record<string, WikiPage>;

    }
}

interface WikiPage {
    pageid: number;
    ns: number;
    title: string;
    revisions: {
      contentformat: string;
      contentmodel: string;
      "*": string;
    }[]
}

interface MapIdWikiRow {
    col1: {
        data: {
            wiki: string;
            text: string;
        }
    };
    col2: {
        data: {
            wiki: string;
            text: string;
        }
    };
    col3: {
        data: {
            wiki: string;
            text: string;
        }
    };
    col4: {
        data: {
            wiki: string;
            text: string;
        }
    }
    col6: {
        data: {
            wiki: string;
            text: string;
        }
    }
}

interface MapIdData {
    id: string;
    author: string;
    world: string;
}

export async function getMapIdData(): Promise<MapIdData[]> {
    const mapIdPages = [
        "yume_2kki:Map_IDs/0000-0400",
        "yume_2kki:Map_IDs/0401-0800",
        "yume_2kki:Map_IDs/0801-1200",
        "yume_2kki:Map_IDs/1201-1600",
        "yume_2kki:Map_IDs/1601-2000",
        "yume_2kki:Map_IDs/2001-2400",
        "yume_2kki:Map_IDs/2401-2800",
        "yume_2kki:Map_IDs/2801-3200",
        "yume_2kki:Map_IDs/3201-3600",
        "yume_2kki:Map_IDs/3601-4000",
    ].join("|")

    const response = await fetch(`https://yume.wiki/api.php?action=query&format=json&titles=${mapIdPages}&prop=revisions&rvprop=content&rvslot=main`);
    const mapIdDataRaw: MapIdDataResponse = await response.json()

    const mapIdData: MapIdData[] = []

    for (const mapIdWikiData of Object.values(mapIdDataRaw.query.pages)) {
        const doc = wtf(mapIdWikiData.revisions?.[0]?.["*"] || "");
        const tables = doc.tables();

        tables.forEach((table) => {
            // @ts-expect-error because the library is regarded and didnt add keyValue as a valid method even tho it is
            const mapIdWikiRows: MapIdWikiRow[] = table.data
            mapIdWikiRows.shift()

            const worldNamePrefix = "[[Yume 2kki:"
            mapIdWikiRows.forEach((row) => {
                if (row.col4.data.text === "Accessible") {
                    const worldsUsedFor = row.col3.data.wiki.split("]] ")
                    worldsUsedFor.forEach((worldName) => {
                        mapIdData.push({
                            id: row.col1.data.text,
                            author: row.col2.data.text,
                            world: worldName.split("|")[0]?.substring(worldNamePrefix.length) || "",
                        });
                    })
                }
            })
        })
    }

    return mapIdData;
}