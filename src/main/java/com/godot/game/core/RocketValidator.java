package com.godot.game.core;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Validates whether an assembled {@link RocketBlueprint} meets all engineering, budget,
 * and schedule constraints for a given {@link MissionContract}.
 */
public final class RocketValidator {

    private RocketValidator() {
    }

    public static ValidationResult validate(RocketBlueprint blueprint, MissionContract contract) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if (blueprint == null || contract == null) {
            errors.add("Blueprint and mission contract are required.");
            return new ValidationResult(false, false, false, false, false, false, errors, warnings);
        }

        if (!blueprint.hasRequiredCoreParts()) {
            if (blueprint.getPayload() == null) {
                errors.add("Missing Payload / Capsule.");
            }
            if (blueprint.getBoosterTank() == null) {
                errors.add("Missing First-Stage Booster Tank.");
            }
            if (blueprint.getMainEngine() == null) {
                errors.add("Missing Main Launch Engine.");
            }
        }

        // 1. Budget check
        long totalCost = blueprint.getTotalCostDollars();
        long maxBudget = contract.getBudgetLimitDollars();
        boolean withinBudget = totalCost <= maxBudget;
        if (!withinBudget) {
            errors.add(String.format(
                    Locale.US,
                    "OVER BUDGET: Rocket costs $%,d (Mission cap: $%,d). Use cheaper or Surplus parts!",
                    totalCost,
                    maxBudget
            ));
        }

        // 2. Time / Deadline check
        int prepDays = blueprint.getTotalPrepDays();
        int deadlineDays = contract.getDeadlineDays();
        boolean withinDeadline = prepDays <= deadlineDays;
        if (!withinDeadline) {
            errors.add(String.format(
                    Locale.US,
                    "TOO SLOW: Assembly takes %d days, but window closes in %d days! Switch to Surplus parts for faster prep.",
                    prepDays,
                    deadlineDays
            ));
        }

        // 3. Payload type & capacity check
        boolean payloadMatches = false;
        RocketPart payload = blueprint.getPayload();
        if (payload != null) {
            boolean typeOk = payload.getPayloadType() == contract.getRequiredPayloadType();
            boolean crewOk = payload.getCrewCapacity() >= contract.getMinCrewCapacity();
            boolean cargoOk = payload.getCargoCapacityKg() >= contract.getMinCargoMassKg();
            payloadMatches = typeOk && crewOk && cargoOk;

            if (!typeOk) {
                errors.add(String.format(
                        Locale.US,
                        "WRONG PAYLOAD: Mission requires %s, but %s is installed.",
                        contract.getRequiredPayloadType().getDisplayName(),
                        payload.getPayloadType() != null ? payload.getPayloadType().getDisplayName() : "None"
                ));
            } else {
                if (!crewOk) {
                    errors.add(String.format(
                            Locale.US,
                            "INSUFFICIENT SEATS: Rescue requires %d crew seats (installed capsule holds %d).",
                            contract.getMinCrewCapacity(),
                            payload.getCrewCapacity()
                    ));
                }
                if (!cargoOk) {
                    errors.add(String.format(
                            Locale.US,
                            "INSUFFICIENT CARGO: Mission requires %.0f kg payload capacity (installed holds %.0f kg).",
                            contract.getMinCargoMassKg(),
                            payload.getCargoCapacityKg()
                    ));
                }
            }
        }

        // 4. Launch TWR check
        double twr = blueprint.getLaunchTwr();
        boolean sufficientTwr = twr >= RocketBlueprint.MIN_SAFE_LAUNCH_TWR;
        if (blueprint.getMainEngine() != null && !sufficientTwr) {
            errors.add(String.format(
                    Locale.US,
                    "INSUFFICIENT THRUST: Launch TWR is %.2f (minimum %.2f required to clear launch tower).",
                    twr,
                    RocketBlueprint.MIN_SAFE_LAUNCH_TWR
            ));
        }

        // 5. Delta-V check
        double totalDeltaV = blueprint.getTotalDeltaVMps();
        double requiredDeltaV = contract.getRequiredDeltaVMps();
        boolean sufficientDeltaV = totalDeltaV >= requiredDeltaV;
        if (blueprint.hasRequiredCoreParts() && !sufficientDeltaV) {
            errors.add(String.format(
                    Locale.US,
                    "INSUFFICIENT DELTA-V: Rocket delivers %.0f m/s, but target orbit requires %.0f m/s.",
                    totalDeltaV,
                    requiredDeltaV
            ));
        }

        // 6. Warnings for surplus reliability
        int surplusCount = blueprint.getSurplusPartCount();
        if (surplusCount > 0) {
            warnings.add(String.format(
                    Locale.US,
                    "SURPLUS ADVISORY: %d refurbished part(s) installed (System reliability: %.0f%%). Expect mid-flight telemetry anomalies!",
                    surplusCount,
                    blueprint.getCombinedReliability() * 100.0
            ));
        }

        boolean validForMission = blueprint.hasRequiredCoreParts()
                && withinBudget
                && withinDeadline
                && payloadMatches
                && sufficientTwr
                && sufficientDeltaV;

        return new ValidationResult(
                validForMission,
                withinBudget,
                withinDeadline,
                payloadMatches,
                sufficientTwr,
                sufficientDeltaV,
                errors,
                warnings
        );
    }
}
