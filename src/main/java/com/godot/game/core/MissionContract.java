package com.godot.game.core;

import java.util.Objects;

/**
 * Defines a space mission contract with payload requirements, orbital Delta-V target,
 * strict budget cap, and countdown deadline (days before launch window closes or oxygen runs out).
 */
public final class MissionContract {
    private final String id;
    private final String codeName;
    private final String briefing;
    private final MissionType missionType;
    private final PayloadType requiredPayloadType;
    private final int minCrewCapacity;
    private final double minCargoMassKg;
    private final double targetAltitudeKm;
    private final double requiredDeltaVMps;
    private final long budgetLimitDollars;
    private final int deadlineDays;
    private final long rewardDollars;

    public MissionContract(
            String id,
            String codeName,
            String briefing,
            MissionType missionType,
            PayloadType requiredPayloadType,
            int minCrewCapacity,
            double minCargoMassKg,
            double targetAltitudeKm,
            double requiredDeltaVMps,
            long budgetLimitDollars,
            int deadlineDays,
            long rewardDollars) {
        this.id = Objects.requireNonNull(id, "id");
        this.codeName = Objects.requireNonNull(codeName, "codeName");
        this.briefing = Objects.requireNonNull(briefing, "briefing");
        this.missionType = Objects.requireNonNull(missionType, "missionType");
        this.requiredPayloadType = Objects.requireNonNull(requiredPayloadType, "requiredPayloadType");
        this.minCrewCapacity = minCrewCapacity;
        this.minCargoMassKg = minCargoMassKg;
        this.targetAltitudeKm = targetAltitudeKm;
        this.requiredDeltaVMps = requiredDeltaVMps;
        this.budgetLimitDollars = budgetLimitDollars;
        this.deadlineDays = deadlineDays;
        this.rewardDollars = rewardDollars;
    }

    public String getId() {
        return id;
    }

    public String getCodeName() {
        return codeName;
    }

    public String getBriefing() {
        return briefing;
    }

    public MissionType getMissionType() {
        return missionType;
    }

    public PayloadType getRequiredPayloadType() {
        return requiredPayloadType;
    }

    public int getMinCrewCapacity() {
        return minCrewCapacity;
    }

    public double getMinCargoMassKg() {
        return minCargoMassKg;
    }

    public double getTargetAltitudeKm() {
        return targetAltitudeKm;
    }

    public double getRequiredDeltaVMps() {
        return requiredDeltaVMps;
    }

    public long getBudgetLimitDollars() {
        return budgetLimitDollars;
    }

    public int getDeadlineDays() {
        return deadlineDays;
    }

    public long getRewardDollars() {
        return rewardDollars;
    }
}
