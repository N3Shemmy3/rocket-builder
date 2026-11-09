package com.godot.game.core;

import java.util.Objects;

/**
 * Immutable representation of a rocket component (Payload, Upper Stage, Booster Tank, or Main Engine).
 */
public final class RocketPart {
    private final String id;
    private final String name;
    private final String description;
    private final PartCategory category;
    private final PartCondition condition;
    private final long costDollars;
    private final int prepDays;
    private final double dryMassKg;
    private final double fuelMassKg;
    private final double thrustKn;
    private final double ispSeconds;
    private final double reliability;
    private final PayloadType payloadType;
    private final int crewCapacity;
    private final double cargoCapacityKg;

    public RocketPart(
            String id,
            String name,
            String description,
            PartCategory category,
            PartCondition condition,
            long costDollars,
            int prepDays,
            double dryMassKg,
            double fuelMassKg,
            double thrustKn,
            double ispSeconds,
            double reliability,
            PayloadType payloadType,
            int crewCapacity,
            double cargoCapacityKg) {
        this.id = Objects.requireNonNull(id, "id");
        this.name = Objects.requireNonNull(name, "name");
        this.description = Objects.requireNonNull(description, "description");
        this.category = Objects.requireNonNull(category, "category");
        this.condition = Objects.requireNonNull(condition, "condition");
        this.costDollars = costDollars;
        this.prepDays = prepDays;
        this.dryMassKg = dryMassKg;
        this.fuelMassKg = fuelMassKg;
        this.thrustKn = thrustKn;
        this.ispSeconds = ispSeconds;
        this.reliability = Math.max(0.1, Math.min(1.0, reliability));
        this.payloadType = payloadType;
        this.crewCapacity = crewCapacity;
        this.cargoCapacityKg = cargoCapacityKg;
    }

    /**
     * Returns a copy of this Factory New part converted into a Surplus/Refurbished variant
     * for underfunded agencies needing to cut costs and prep time.
     */
    public RocketPart asSurplus() {
        if (this.condition == PartCondition.SURPLUS_REFURBISHED) {
            return this;
        }
        PartCondition surplus = PartCondition.SURPLUS_REFURBISHED;
        long discountedCost = Math.round((this.costDollars * surplus.getCostMultiplier()) / 10_000.0) * 10_000L;
        int fasterPrep = Math.max(1, (int) Math.floor(this.prepDays * surplus.getPrepTimeMultiplier()));
        double reducedIsp = Math.round(this.ispSeconds * surplus.getIspMultiplier());
        double reducedReliability = Math.max(0.50, this.reliability - surplus.getReliabilityPenalty());

        return new RocketPart(
                this.id + "_surplus",
                this.name + " [Surplus]",
                this.description + " (Refurbished surplus stock: cheaper & faster to prep, higher malfunction risk.)",
                this.category,
                surplus,
                discountedCost,
                fasterPrep,
                this.dryMassKg,
                this.fuelMassKg,
                this.thrustKn,
                reducedIsp,
                reducedReliability,
                this.payloadType,
                this.crewCapacity,
                this.cargoCapacityKg
        );
    }

    /**
     * Returns the part in the requested condition (Factory New vs. Surplus Refurbished).
     */
    public RocketPart withCondition(PartCondition targetCondition) {
        if (this.condition == targetCondition) {
            return this;
        }
        if (targetCondition == PartCondition.SURPLUS_REFURBISHED) {
            return asSurplus();
        }
        throw new IllegalStateException("Cannot convert surplus part back without base catalog reference.");
    }

    public double getWetMassKg() {
        return dryMassKg + fuelMassKg;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public PartCategory getCategory() {
        return category;
    }

    public PartCondition getCondition() {
        return condition;
    }

    public long getCostDollars() {
        return costDollars;
    }

    public int getPrepDays() {
        return prepDays;
    }

    public double getDryMassKg() {
        return dryMassKg;
    }

    public double getFuelMassKg() {
        return fuelMassKg;
    }

    public double getThrustKn() {
        return thrustKn;
    }

    public double getIspSeconds() {
        return ispSeconds;
    }

    public double getReliability() {
        return reliability;
    }

    public PayloadType getPayloadType() {
        return payloadType;
    }

    public int getCrewCapacity() {
        return crewCapacity;
    }

    public double getCargoCapacityKg() {
        return cargoCapacityKg;
    }
}
