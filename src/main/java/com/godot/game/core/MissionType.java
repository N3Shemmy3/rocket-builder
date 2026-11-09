package com.godot.game.core;

/**
 * High-level mission categories dispatched by Earth Mission Control.
 */
public enum MissionType {
    RESUPPLY("Orbital Station Resupply"),
    ASTRONAUT_RESCUE("Emergency Astronaut Rescue"),
    SCIENCE_DELIVERY("Deep-Space Science Deployment");

    private final String displayName;

    MissionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
