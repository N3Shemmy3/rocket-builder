package com.godot.game.core;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a complete or partial rocket assembly in the VAB.
 * Computes total cost, build/prep time, mass breakdown, launch Thrust-to-Weight Ratio (TWR),
 * and multi-stage Delta-V using the Tsiolkovsky rocket equation.
 */
public final class RocketBlueprint {
    public static final double STANDARD_GRAVITY = 9.80665;
    public static final double MIN_SAFE_LAUNCH_TWR = 1.15;

    private RocketPart payload;
    private RocketPart upperStage; // Optional second stage for higher orbit missions
    private RocketPart boosterTank;
    private RocketPart mainEngine;

    public RocketBlueprint() {
    }

    public RocketBlueprint(
            RocketPart payload,
            RocketPart upperStage,
            RocketPart boosterTank,
            RocketPart mainEngine) {
        this.payload = payload;
        this.upperStage = upperStage;
        this.boosterTank = boosterTank;
        this.mainEngine = mainEngine;
    }

    public List<RocketPart> getInstalledParts() {
        List<RocketPart> parts = new ArrayList<>(4);
        if (payload != null) {
            parts.add(payload);
        }
        if (upperStage != null) {
            parts.add(upperStage);
        }
        if (boosterTank != null) {
            parts.add(boosterTank);
        }
        if (mainEngine != null) {
            parts.add(mainEngine);
        }
        return parts;
    }

    public boolean hasRequiredCoreParts() {
        return payload != null && boosterTank != null && mainEngine != null;
    }

    public long getTotalCostDollars() {
        long total = 0L;
        for (RocketPart part : getInstalledParts()) {
            total += part.getCostDollars();
        }
        return total;
    }

    public int getTotalPrepDays() {
        int days = 0;
        for (RocketPart part : getInstalledParts()) {
            days += part.getPrepDays();
        }
        return days;
    }

    public double getTotalWetMassKg() {
        double mass = 0.0;
        for (RocketPart part : getInstalledParts()) {
            mass += part.getWetMassKg();
        }
        return mass;
    }

    public double getTotalDryMassKg() {
        double mass = 0.0;
        for (RocketPart part : getInstalledParts()) {
            mass += part.getDryMassKg();
        }
        return mass;
    }

    /**
     * Computes Launchpad Thrust-to-Weight Ratio (TWR).
     * TWR must exceed 1.0 (ideally >= 1.15) to overcome Earth gravity at liftoff.
     */
    public double getLaunchTwr() {
        if (mainEngine == null) {
            return 0.0;
        }
        double totalWetMass = getTotalWetMassKg();
        if (totalWetMass <= 0.0) {
            return 0.0;
        }
        double thrustNewtons = mainEngine.getThrustKn() * 1000.0;
        double weightNewtons = totalWetMass * STANDARD_GRAVITY;
        return thrustNewtons / weightNewtons;
    }

    /**
     * Computes Delta-V (m/s) provided by the First Stage (Main Engine burning Booster Tank fuel).
     */
    public double getStage1DeltaVMps() {
        if (mainEngine == null || boosterTank == null) {
            return 0.0;
        }
        double wetMass = getTotalWetMassKg();
        double fuelMass = boosterTank.getFuelMassKg();
        double dryMassAfterStage1Burn = wetMass - fuelMass;
        if (fuelMass <= 0.0 || dryMassAfterStage1Burn <= 0.0) {
            return 0.0;
        }
        return mainEngine.getIspSeconds() * STANDARD_GRAVITY * Math.log(wetMass / dryMassAfterStage1Burn);
    }

    /**
     * Computes Delta-V (m/s) provided by the Upper Stage after Stage 1 separation.
     */
    public double getUpperStageDeltaVMps() {
        if (upperStage == null || payload == null) {
            return 0.0;
        }
        double stage2WetMass = payload.getWetMassKg() + upperStage.getWetMassKg();
        double stage2DryMass = payload.getWetMassKg() + upperStage.getDryMassKg();
        if (upperStage.getFuelMassKg() <= 0.0 || stage2DryMass <= 0.0) {
            return 0.0;
        }
        return upperStage.getIspSeconds() * STANDARD_GRAVITY * Math.log(stage2WetMass / stage2DryMass);
    }

    /**
     * Computes total multi-stage Delta-V (m/s).
     */
    public double getTotalDeltaVMps() {
        return getStage1DeltaVMps() + getUpperStageDeltaVMps();
    }

    /**
     * Computes overall system reliability (0.0 to 1.0) as the product of installed component reliabilities.
     */
    public double getCombinedReliability() {
        List<RocketPart> parts = getInstalledParts();
        if (parts.isEmpty()) {
            return 0.0;
        }
        double reliability = 1.0;
        for (RocketPart part : parts) {
            reliability *= part.getReliability();
        }
        return reliability;
    }

    public int getSurplusPartCount() {
        int count = 0;
        for (RocketPart part : getInstalledParts()) {
            if (part.getCondition() == PartCondition.SURPLUS_REFURBISHED) {
                count++;
            }
        }
        return count;
    }

    public RocketPart getPayload() {
        return payload;
    }

    public void setPayload(RocketPart payload) {
        this.payload = payload;
    }

    public RocketPart getUpperStage() {
        return upperStage;
    }

    public void setUpperStage(RocketPart upperStage) {
        this.upperStage = upperStage;
    }

    public RocketPart getBoosterTank() {
        return boosterTank;
    }

    public void setBoosterTank(RocketPart boosterTank) {
        this.boosterTank = boosterTank;
    }

    public RocketPart getMainEngine() {
        return mainEngine;
    }

    public void setMainEngine(RocketPart mainEngine) {
        this.mainEngine = mainEngine;
    }
}
