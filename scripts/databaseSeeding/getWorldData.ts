import {AppDBWorldData} from "@/app/lib/database/databaseTypes";
import wtf from 'wtf_wikipedia';
import {getMapIdData} from "@/scripts/databaseSeeding/getMapIdData";

interface LocationsWikiDataList {
    batchcomplete: string;
    continue: {
        gcmcontinue?: string;
        continue: string;
    };
    query: {
        pages: object
    }
}

interface LocationWikiData {
    pageid: number;
    ns: number;
    title: string;
    revisions: {
        contentformat: string;
        contentmodel: string;
        "*": string;
    }[]
}

interface WorldDataRaw {
    title: string;
    pageId: number;
    url: string;
    content: string;
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

    let counter = 0
    do {
        const infoboxResponse = await fetch(
            `https://yume.wiki/api.php?action=query&generator=categorymembers&gcmtitle=Category:Yume_2kki_Locations&gcmlimit=50&prop=revisions&rvprop=content&format=json&gcmcontinue=${gcmcontinue}`
        )

        const data: LocationsWikiDataList = await infoboxResponse.json();

        const prefix = "Yume 2kki:"
        const worlds: WorldDataRaw[] = Object.values(
            data.query.pages
        ).map((world: LocationWikiData) => ({
            title: world.title,
            pageId: world.pageid,
            url: `https://yume.wiki/2kki/${world.title.substring(prefix.length).replace(/ /g, '_')}`,
            content: world.revisions[0]["*"]
        }))

        counter += 50
        console.log(`Fetched data for ${counter} worlds...`)

        allWorlds = [...allWorlds, ...worlds];
        gcmcontinue	 = data.continue?.gcmcontinue || '';
    } while (gcmcontinue	)

    console.log("Finished fetching all worlds")
    return allWorlds;
}