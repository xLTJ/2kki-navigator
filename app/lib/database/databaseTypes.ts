import {MapConnection} from "@/scripts/databaseSeeding/types";

export interface AppDBMapData {
    mapId: string;
    worldId: string;
    outgoingConnections: MapConnection[];
    incomingConnections: MapConnection[];
}

export interface AppDBWorldData {
    worldId: number;
    name: string;
    description?: string;
    author: string | undefined;
    releaseVersion: string | undefined;
    lastUpdatedVersion: string | undefined;
    wikiUrl: string;

    maps: AppDBMapData[]
    outgoingConnections: AppDBWorldConnection[];
    incomingConnections: AppDBWorldConnection[];
}

export interface AppDBWorldConnection {
    id: number;
    sourceWorldId: number;
    targetWorldId: number;

    effectRequired?: string;
    unlockCondition?: string;
    isolatedTarget: boolean; // For connections that lead to an isolated section of another world
    chance?: number; // For connections that are only available by chance
    telephoneConnection: boolean; // For shortcuts accessible from the telephone found in Urotsuki's Dream Apartments
    seasonalConnection: boolean; // For connections available only in certain seasons
}