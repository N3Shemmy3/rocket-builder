package com.godot.game.core;

import java.util.Collections;
import java.util.List;

/**
 * Result of validating a {@link RocketBlueprint} against a {@link MissionContract}.
 */
public final class ValidationResult {
    private final boolean validForMission;
    private final boolean withinBudget;
    private final boolean withinDeadline;
    private final boolean payloadMatches;
    private final boolean sufficientTwr;
    private final boolean sufficientDeltaV;
    private final List<String> errors;
    private final List<String> warnings;

    public ValidationResult(
            boolean validForMission,
            boolean withinBudget,
            boolean withinDeadline,
            boolean payloadMatches,
            boolean sufficientTwr,
            boolean sufficientDeltaV,
            List<String> errors,
            List<String> warnings) {
        this.validForMission = validForMission;
        this.withinBudget = withinBudget;
        this.withinDeadline = withinDeadline;
        this.payloadMatches = payloadMatches;
        this.sufficientTwr = sufficientTwr;
        this.sufficientDeltaV = sufficientDeltaV;
        this.errors = Collections.unmodifiableList(errors);
        this.warnings = Collections.unmodifiableList(warnings);
    }

    public boolean isValidForMission() {
        return validForMission;
    }

    public boolean isWithinBudget() {
        return withinBudget;
    }

    public boolean isWithinDeadline() {
        return withinDeadline;
    }

    public boolean isPayloadMatches() {
        return payloadMatches;
    }

    public boolean isSufficientTwr() {
        return sufficientTwr;
    }

    public boolean isSufficientDeltaV() {
        return sufficientDeltaV;
    }

    public List<String> getErrors() {
        return errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }
}
