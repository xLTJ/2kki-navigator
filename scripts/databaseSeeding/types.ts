export interface MapConnection {
    sourceMapId: string;
    targetMapId: string;
    effectRequired?: string;
    switchRequirementId?: string;
    switchRequirementDescription?: string;
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

// -------------------------------------------- Map data types -------------------------------------


export interface GameDBChipSet {
    name: string;
    chipset_name: string;
    terrain_data: string;
    passable_data_lower: string;
    passable_data_upper: string;
    animation_type: number;
    animation_speed: number;
}

export interface GameDBMapData {
    LMU: {
        Map: {
            chipset_id: number;
            width: number;
            height: number;
            scroll_type: number;
            parallax_flag: string;
            parallax_name: string;
            parallax_loop_x: string;
            parallax_loop_y: string;
            parallax_auto_loop_x: string;
            parallax_sx: number;
            parallax_auto_loop_y: string;
            parallax_sy: number;
            generator_flag: string;
            generator_mode: number;
            top_level: string;
            generator_tiles: number;
            generator_width: number;
            generator_height: number;
            generator_surround: string;
            generator_upper_wall: string;
            generator_floor_b: string;
            generator_floor_c: string;
            generator_extra_b: string;
            generator_extra_c: string;
            generator_x: string;
            generator_y: string;
            generator_tile_ids: string;
            lower_layer: string;
            upper_layer: string;
            events: {
                Event: GameDBMapEvent[];
            }
            save_count_2k3e: number;
            save_count: number;
        }
    }
}

export interface GameDBMapEvent {
    name: string;
    x: number;
    y: number;
    pages: {
        EventPage: {
            condition: GameDBEventCondition;
            character_name: string;
            character_index: number;
            character_direction: number;
            character_pattern: number;
            translucent: string;
            move_type: number;
            move_frequency: number;
            trigger: number;
            layer: number;
            overlap_forbidden: string;
            animation_type: number;
            move_speed: number;
            move_route: {
                MoveRoute: {
                    move_commands: string;
                    repeat: string;
                    skippable: string;
                }
            };
            event_commands: {
                EventCommand: GameDBEventCommand[];
            }
        }
    }
}

export interface GameDBEventCondition {
    flags: {
        EventPageCondition_Flags: {
            switch_a: string;
            switch_b: string;
            variable: string;
            item: string;
            actor: string;
            timer: string;
            timer2: string;
        }
    };
    switch_a_id: number;
    switch_b_id: number;
    variable_id: string;
    variable_value: string;
    item_id: string;
    actor_id: string;
    timer_sec: number;
    timer2_sec: number;
    compare_operator: number;
}

export interface GameDBEventCommand {
    code: number;
    indent: number;
    string: string;
    parameters: string;
}

