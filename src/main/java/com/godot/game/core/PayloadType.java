package com.godot.game.core;

/**
 * Specific types of payloads required by different space missions.
 */
public enum PayloadType {
    CREW_RESCUE_CAPSULE("Crew Rescue Capsule"),
    SUPPLY_CARGO_POD("Pressurized Supply Pod"),
    SCIENCE_EQUIPMENT("Orbital Science Array");

    private final String displayName;

    PayloadType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
