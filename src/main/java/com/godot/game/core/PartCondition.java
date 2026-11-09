package com.godot.game.core;

/**
 * Represents whether a rocket part is factory-new or a discounted surplus/refurbished part.
 * Underfunded Mission Control teams can use surplus parts to save money and prep time at the cost
 * of slightly lower efficiency and higher in-flight anomaly risk.
 */
public enum PartCondition {
    FACTORY_NEW("Factory New", 1.0, 1.0, 1.0, 0.0),
    SURPLUS_REFURBISHED("Surplus / Refurbished", 0.55, 0.50, 0.95, 0.16);

    private final String label;
    private final double costMultiplier;
    private final double prepTimeMultiplier;
    private final double ispMultiplier;
    private final double reliabilityPenalty;

    PartCondition(
            String label,
            double costMultiplier,
            double prepTimeMultiplier,
            double ispMultiplier,
            double reliabilityPenalty) {
        this.label = label;
        this.costMultiplier = costMultiplier;
        this.prepTimeMultiplier = prepTimeMultiplier;
        this.ispMultiplier = ispMultiplier;
        this.reliabilityPenalty = reliabilityPenalty;
    }

    public String getLabel() {
        return label;
    }

    public double getCostMultiplier() {
        return costMultiplier;
    }

    public double getPrepTimeMultiplier() {
        return prepTimeMultiplier;
    }

    public double getIspMultiplier() {
        return ispMultiplier;
    }

    public double getReliabilityPenalty() {
        return reliabilityPenalty;
    }
}
