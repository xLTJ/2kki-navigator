import type { AppDBWorldData } from "~/server/api/routers/databaseTypes";
import wtf from 'wtf_wikipedia';
import {getMapIdData} from "./getMapIdData";

interface LocationsWikiInfoboxList {
    batchcomplete: string;
    continue: {
        gcmcontinue?: string;
        continue: string;
    };
    query: {
        pages: Record<number, LocationInfoboxData>
    }
}

interface LocationInfoboxData {
    pageid: number;
    ns: number;
    title: string;
    revisions: {
        contentformat: string;
        contentmodel: string;
        "*": string;
    }[]
}

interface LocationMapIdDataList {
    "query-continute-offset": number;
    query: {
        meta: object;
        results: Record<string, LocationMapIdData>
    }
}

interface LocationMapIdData {
    printouts: {
        "Map IDs": {
            "Has map ID": {
                label: string;
                key: string;
                typeid: string;
                item: number[];
            }
        }[];
        "Map ID annotation": object
    };
    fulltext: string;
    fullurl: string;
    namespace: number;
    exists: string;
    displaytitle: string;
}

interface WorldDataRaw {
    title: string;
    pageId: number;
    url: string;
    content: string;
    mapIds: number[];
}

export async function getWorldData() {
    await getMapIdData()
    const worlds = await getAllWorlds()
    // const worldCount = worlds.length;

    const allWorldData: AppDBWorldData[] = [];

    console.log("Parsing world data...")
    for (const world of worlds.values()) {
        // console.log(`Fetching data for ${world.title}... (${index}/${worldCount})`);

        const worldData: AppDBWorldData = parseRawWorldData(world);
        allWorldData.push(worldData);
    }
}

function parseRawWorldData(world: WorldDataRaw): AppDBWorldData {
    const doc = wtf(world.content)
    const locationBox = doc.templates()

    if (!locationBox) {
        return {
            worldId: world.pageId,
            name: world.title,
            author: undefined,
            releaseVersion: undefined,
            lastUpdatedVersion: undefined,
            wikiUrl: world.url,

            maps: [],
            outgoingConnections: [],
            incomingConnections: [],
        }
    }

    return {
        worldId: world.pageId,
        name: world.title,
        author: undefined,
        releaseVersion: undefined,
        lastUpdatedVersion: undefined,
        wikiUrl: world.url,

        maps: [],
        outgoingConnections: [],
        incomingConnections: [],
    }
}

async function getAllWorlds(): Promise<WorldDataRaw[]> {
    console.log("Fetching all worlds...")
    let allWorlds: WorldDataRaw[] = [];
    let gcmcontinue	 = "";

    const allInfoBoxData: LocationInfoboxData[] = [];
    const allMapIdData: LocationMapIdData[] = [];

    let counter = 0
    do {
        const infoboxResponse = fetch(
            `https://yume.wiki/api.php?action=query&generator=categorymembers&gcmtitle=Category:Yume_2kki_Locations&gcmlimit=50&prop=revisions&rvprop=content&format=json&gcmcontinue=${gcmcontinue}`
        )

        const mapIdResponse = fetch(
            `https://yume.wiki/api.php?action=ask&query=[[Category:Yume_2kki_Locations]]|?Map_IDs|offset=${counter}&format=json`
        )

        const infoBoxData: LocationsWikiInfoboxList = await (await infoboxResponse).json();
        const mapIdData: LocationMapIdDataList = await (await mapIdResponse).json()

        for (const data of Object.values(infoBoxData.query.pages)) {
            if (data.title.includes("Category")) {
                continue
            }
            allInfoBoxData.push(data)
        }

        for (const data of Object.values(mapIdData.query.results)) {
            allMapIdData.push(data)
        }

        counter += 50
        console.log(`Fetched data for ${counter} worlds...`)
        gcmcontinue	 = infoBoxData.continue?.gcmcontinue || '';
    } while (gcmcontinue)

    return parseData(allInfoBoxData, allMapIdData)
}

function parseData(infoBoxData: LocationInfoboxData[], mapIdData: LocationMapIdData[]): WorldDataRaw[] {
    const prefix = "Yume 2kki:"
    return infoBoxData.map((world: LocationInfoboxData) => ({
        title: world.title,
        pageId: world.pageid,
        url: `https://yume.wiki/2kki/${world.title.substring(prefix.length).replace(/ /g, '_')}`,
        content: world.revisions?.[0]?.["*"] ?? "",
        mapIds: mapIdData
            .filter(data => data.fulltext === world.title)
            .map(data => data.printouts["Map IDs"]
                .map(mapIds => mapIds["Has map ID"].item)
            )
            .flat()
            .flat()
    }));
}