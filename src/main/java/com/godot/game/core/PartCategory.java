package com.godot.game.core;

/**
 * Categories of modular rocket components available in the Vehicle Assembly Building (VAB).
 */
public enum PartCategory {
    PAYLOAD("Payload / Capsule"),
    UPPER_STAGE("Upper Orbital Stage"),
    BOOSTER_TANK("Main Booster Fuel Tank"),
    ENGINE("Main Launch Engine");

    private final String displayName;

    PartCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
