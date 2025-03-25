export interface MapConnection {
    sourceMapId: string;
    targetMapId: string;
    effectRequired?: string;
    switchRequirementId?: string;
    switchRequirementDescription?: string;
}

export interface MapData {
    mapId: string;
    worldId: string;
    outgoingConnections: MapConnection[];
    incomingConnections: MapConnection[];
}

export interface GameDBChipSet {
    name: string;
    chipset_name: string;
    terrain_data: string;
    passable_data_lower: string;
    passable_data_upper: string;
    animation_type: number;
    animation_speed: number;
}

export interface AppDBChipSet {
    imageKey: string;
    upperPassibility: number[];
    lowerPassibility: number[];
}

export interface TilePassability {
    down: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
}