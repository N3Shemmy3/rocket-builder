package com.godot.game.core;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RocketCoreTest {

    @Test
    void testMission1LeoResupplyValidWithFactoryParts() {
        MissionContract m1 = MissionCatalog.getMission(0);
        RocketBlueprint blueprint = new RocketBlueprint(
                PartCatalog.findById("payload_supply_basic").orElseThrow(),
                null,
                PartCatalog.findById("tank_small").orElseThrow(),
                PartCatalog.findById("engine_kero_basic").orElseThrow()
        );

        ValidationResult result = RocketValidator.validate(blueprint, m1);
        assertTrue(result.isValidForMission(), () -> "Expected Mission 1 valid, errors: " + result.getErrors());
        assertEquals(6_400_000L, blueprint.getTotalCostDollars());
        assertEquals(6, blueprint.getTotalPrepDays());
        assertTrue(blueprint.getLaunchTwr() >= 1.15);
        assertTrue(blueprint.getTotalDeltaVMps() >= m1.getRequiredDeltaVMps());
    }

    @Test
    void testMission2RescueFailsWithAllFactoryNewDueToBudgetAndDeadline() {
        MissionContract m2 = MissionCatalog.getMission(1);
        RocketBlueprint allFactory = new RocketBlueprint(
                PartCatalog.findById("payload_rescue_leo").orElseThrow(),
                null,
                PartCatalog.findById("tank_small").orElseThrow(),
                PartCatalog.findById("engine_kero_basic").orElseThrow()
        );

        ValidationResult factoryResult = RocketValidator.validate(allFactory, m2);
        assertFalse(factoryResult.isValidForMission());
        assertFalse(factoryResult.isWithinBudget(), "All factory-new parts should exceed the slashed rescue budget");
        assertFalse(factoryResult.isWithinDeadline(), "All factory-new parts should exceed the 4-day oxygen deadline");
    }

    @Test
    void testMission2RescueSucceedsWithSurplusRefurbishedParts() {
        MissionContract m2 = MissionCatalog.getMission(1);
        RocketBlueprint surplusRescue = new RocketBlueprint(
                PartCatalog.findById("payload_rescue_leo").orElseThrow().asSurplus(),
                null,
                PartCatalog.findById("tank_small").orElseThrow().asSurplus(),
                PartCatalog.findById("engine_kero_basic").orElseThrow().asSurplus()
        );

        ValidationResult surplusResult = RocketValidator.validate(surplusRescue, m2);
        assertTrue(surplusResult.isValidForMission(), () -> "Expected Surplus Rescue valid, errors: " + surplusResult.getErrors());
        assertFalse(surplusResult.getWarnings().isEmpty(), "Should warn about surplus part reliability");
    }

    @Test
    void testMission3ScienceRequiresTwoStageRocket() {
        MissionContract m3 = MissionCatalog.getMission(2);
        RocketBlueprint twoStage = new RocketBlueprint(
                PartCatalog.findById("payload_science_sat").orElseThrow(),
                PartCatalog.findById("upper_light").orElseThrow(),
                PartCatalog.findById("tank_medium").orElseThrow().asSurplus(),
                PartCatalog.findById("engine_methalox_mid").orElseThrow().asSurplus()
        );

        ValidationResult result = RocketValidator.validate(twoStage, m3);
        assertTrue(result.isValidForMission(), () -> "Expected Mission 3 valid, errors: " + result.getErrors());
        assertTrue(twoStage.getUpperStageDeltaVMps() > 1500.0);
    }

    @Test
    void testMission4HeavyResupplySolvable() {
        MissionContract m4 = MissionCatalog.getMission(3);
        RocketBlueprint heavyResupply = new RocketBlueprint(
                PartCatalog.findById("payload_supply_heavy").orElseThrow().asSurplus(),
                PartCatalog.findById("upper_light").orElseThrow(),
                PartCatalog.findById("tank_medium").orElseThrow().asSurplus(),
                PartCatalog.findById("engine_methalox_mid").orElseThrow()
        );

        ValidationResult result = RocketValidator.validate(heavyResupply, m4);
        assertTrue(result.isValidForMission(), () -> "Expected Mission 4 valid, errors: " + result.getErrors());
    }

    @Test
    void testMission5CislunarRescueSolvable() {
        MissionContract m5 = MissionCatalog.getMission(4);
        RocketBlueprint cislunarRescue = new RocketBlueprint(
                PartCatalog.findById("payload_rescue_deep").orElseThrow().asSurplus(),
                PartCatalog.findById("upper_heavy").orElseThrow(),
                PartCatalog.findById("tank_heavy").orElseThrow().asSurplus(),
                PartCatalog.findById("engine_heavy_lifter").orElseThrow().asSurplus()
        );

        ValidationResult result = RocketValidator.validate(cislunarRescue, m5);
        assertTrue(result.isValidForMission(), () -> "Expected Mission 5 valid, errors: " + result.getErrors());
    }

    @Test
    void testLowTwrAndWrongPayloadDetected() {
        MissionContract m1 = MissionCatalog.getMission(0);
        // Put the heaviest tank + heavy upper stage on the weakest engine, plus wrong payload type
        RocketBlueprint badRocket = new RocketBlueprint(
                PartCatalog.findById("payload_rescue_deep").orElseThrow(),
                PartCatalog.findById("upper_heavy").orElseThrow(),
                PartCatalog.findById("tank_heavy").orElseThrow(),
                PartCatalog.findById("engine_kero_basic").orElseThrow()
        );

        ValidationResult result = RocketValidator.validate(badRocket, m1);
        assertFalse(result.isValidForMission());
        assertFalse(result.isPayloadMatches());
        assertFalse(result.isSufficientTwr());
    }

    @Test
    void testTwoStageFlightSimulationAndSurplusAnomalyOverride() {
        MissionContract m3 = MissionCatalog.getMission(2);
        RocketBlueprint twoStage = new RocketBlueprint(
                PartCatalog.findById("payload_science_sat").orElseThrow(),
                PartCatalog.findById("upper_light").orElseThrow(),
                PartCatalog.findById("tank_medium").orElseThrow().asSurplus(),
                PartCatalog.findById("engine_methalox_mid").orElseThrow().asSurplus()
        );

        FlightSimulation sim = new FlightSimulation(twoStage, m3);
        sim.startLaunch();
        assertEquals(FlightSimulation.Phase.STAGE_1_ASCENT, sim.getPhase());

        for (int i = 0; i < 60; i++) {
            sim.step(0.25);
            if (sim.isAnomalyActive()) {
                sim.resolveAnomaly();
            }
            if (sim.getPhase() == FlightSimulation.Phase.AWAITING_STAGE_SEP) {
                sim.triggerStageSeparation();
            }
        }

        assertEquals(FlightSimulation.Phase.ORBIT_ACHIEVED, sim.getPhase());
    }
}
