package com.godot.game.core;

import java.util.Locale;

/**
 * Pure Java state machine for simulating a rocket launch and Mission Control telemetry in 2D.
 * Supports two-stage burns, mid-flight surplus component anomalies, and emergency overrides.
 */
public final class FlightSimulation {

    public enum Phase {
        PRE_LAUNCH("PAD STANDBY"),
        STAGE_1_ASCENT("STAGE 1 MAIN BURN"),
        AWAITING_STAGE_SEP("BOOSTER MECO — STAGE SEPARATION REQUIRED"),
        UPPER_STAGE_BURN("STAGE 2 ORBITAL INSERTION"),
        ORBIT_ACHIEVED("MISSION SUCCESS — ORBIT ACHIEVED"),
        MISSION_ABORTED("MISSION FAILED — TELEMETRY LOST");

        private final String displayName;

        Phase(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    private final RocketBlueprint blueprint;
    private final MissionContract contract;

    private Phase phase = Phase.PRE_LAUNCH;
    private double elapsedSeconds = 0.0;
    private double currentVelocityMps = 0.0;
    private double currentAltitudeKm = 0.0;
    private double stage1FuelRemainingRatio = 1.0;
    private double stage2FuelRemainingRatio = 1.0;

    private boolean anomalyActive = false;
    private boolean anomalyTriggeredOnce = false;
    private double anomalyCountdownSeconds = 0.0;
    private String activeAnomalyMessage = "";
    private String statusLog = "Rocket on pad. All Mission Control stations polling GO.";

    public FlightSimulation(RocketBlueprint blueprint, MissionContract contract) {
        this.blueprint = blueprint;
        this.contract = contract;
        if (blueprint.getUpperStage() == null) {
            this.stage2FuelRemainingRatio = 0.0;
        }
    }

    public void startLaunch() {
        if (phase == Phase.PRE_LAUNCH) {
            phase = Phase.STAGE_1_ASCENT;
            statusLog = "T+00.0s: Main Engine Ignition! Liftoff of " + contract.getCodeName() + "!";
        }
    }

    /**
     * Advances the flight telemetry simulation by {@code deltaSeconds}.
     */
    public void step(double deltaSeconds) {
        if (phase == Phase.PRE_LAUNCH || phase == Phase.ORBIT_ACHIEVED || phase == Phase.MISSION_ABORTED) {
            return;
        }

        elapsedSeconds += deltaSeconds;

        // Handle active surplus part anomaly timer
        if (anomalyActive) {
            anomalyCountdownSeconds -= deltaSeconds;
            if (anomalyCountdownSeconds <= 0.0) {
                anomalyActive = false;
                phase = Phase.MISSION_ABORTED;
                statusLog = "CRITICAL FAILURE: Unresolved surplus hardware anomaly caused loss of vehicle!";
                return;
            }
        } else if (!anomalyTriggeredOnce
                && blueprint.getSurplusPartCount() > 0
                && elapsedSeconds >= 3.2
                && (phase == Phase.STAGE_1_ASCENT || phase == Phase.UPPER_STAGE_BURN)) {
            triggerSurplusAnomaly();
        }

        double speedGainFactor = anomalyActive ? 0.35 : 1.0;

        if (phase == Phase.STAGE_1_ASCENT) {
            double burnDuration = 6.0; // 6 seconds for Stage 1 visual ascent
            double stepFraction = (deltaSeconds / burnDuration) * speedGainFactor;
            double actualBurn = Math.min(stage1FuelRemainingRatio, stepFraction);
            stage1FuelRemainingRatio = Math.max(0.0, stage1FuelRemainingRatio - actualBurn);

            currentVelocityMps += blueprint.getStage1DeltaVMps() * actualBurn;
            double stage1AltShare = blueprint.getUpperStage() != null ? 0.38 : 1.0;
            currentAltitudeKm += contract.getTargetAltitudeKm() * stage1AltShare * actualBurn;

            if (stage1FuelRemainingRatio <= 0.001) {
                stage1FuelRemainingRatio = 0.0;
                if (blueprint.getUpperStage() != null) {
                    phase = Phase.AWAITING_STAGE_SEP;
                    statusLog = "MECO (Main Engine Cutoff)! Press [STAGE SEPARATION] to ignite Upper Stage!";
                } else {
                    completeOrbitCheck();
                }
            }
        } else if (phase == Phase.AWAITING_STAGE_SEP) {
            // Slight coasting while awaiting stage separation button press
            currentAltitudeKm += 2.0 * deltaSeconds;
        } else if (phase == Phase.UPPER_STAGE_BURN) {
            double burnDuration = 5.0; // 5 seconds for Stage 2 orbital insertion
            double stepFraction = (deltaSeconds / burnDuration) * speedGainFactor;
            double actualBurn = Math.min(stage2FuelRemainingRatio, stepFraction);
            stage2FuelRemainingRatio = Math.max(0.0, stage2FuelRemainingRatio - actualBurn);

            currentVelocityMps += blueprint.getUpperStageDeltaVMps() * actualBurn;
            currentAltitudeKm += contract.getTargetAltitudeKm() * 0.62 * actualBurn;

            if (stage2FuelRemainingRatio <= 0.001) {
                stage2FuelRemainingRatio = 0.0;
                completeOrbitCheck();
            }
        }
    }

    public void triggerStageSeparation() {
        if (phase == Phase.AWAITING_STAGE_SEP && blueprint.getUpperStage() != null) {
            phase = Phase.UPPER_STAGE_BURN;
            statusLog = "Stage 1 Jettisoned! Upper Stage '" + blueprint.getUpperStage().getName() + "' ignited!";
        }
    }

    public void resolveAnomaly() {
        if (anomalyActive) {
            anomalyActive = false;
            activeAnomalyMessage = "";
            statusLog = "Mission Control Override Successful! Backup telemetry valves stabilized.";
        }
    }

    private void triggerSurplusAnomaly() {
        anomalyTriggeredOnce = true;
        anomalyActive = true;
        anomalyCountdownSeconds = 6.5;
        activeAnomalyMessage = String.format(
                Locale.US,
                "ALARM: Surplus turbopump pressure spike (%d surplus part(s))! Click [OVERRIDE ANOMALY] now!",
                blueprint.getSurplusPartCount()
        );
        statusLog = activeAnomalyMessage;
    }

    private void completeOrbitCheck() {
        if (anomalyActive) {
            phase = Phase.MISSION_ABORTED;
            statusLog = "Burn finished with unresolved hardware fault — orbital insertion failed!";
            return;
        }
        if (currentVelocityMps + 25.0 >= contract.getRequiredDeltaVMps()) {
            currentVelocityMps = Math.max(currentVelocityMps, contract.getRequiredDeltaVMps());
            currentAltitudeKm = Math.max(currentAltitudeKm, contract.getTargetAltitudeKm());
            phase = Phase.ORBIT_ACHIEVED;
            statusLog = "ORBIT CONFIRMED! " + contract.getCodeName() + " payload deployed successfully!";
        } else {
            phase = Phase.MISSION_ABORTED;
            statusLog = String.format(
                    Locale.US,
                    "SUBORBITAL SHORTFALL: Reached %.0f m/s (Needed %.0f m/s).",
                    currentVelocityMps,
                    contract.getRequiredDeltaVMps()
            );
        }
    }

    public Phase getPhase() {
        return phase;
    }

    public double getElapsedSeconds() {
        return elapsedSeconds;
    }

    public double getCurrentVelocityMps() {
        return currentVelocityMps;
    }

    public double getCurrentAltitudeKm() {
        return currentAltitudeKm;
    }

    public double getStage1FuelRemainingRatio() {
        return stage1FuelRemainingRatio;
    }

    public double getStage2FuelRemainingRatio() {
        return stage2FuelRemainingRatio;
    }

    public boolean isAnomalyActive() {
        return anomalyActive;
    }

    public double getAnomalyCountdownSeconds() {
        return anomalyCountdownSeconds;
    }

    public String getActiveAnomalyMessage() {
        return activeAnomalyMessage;
    }

    public String getStatusLog() {
        return statusLog;
    }

    public double getOverallProgressRatio() {
        if (contract.getRequiredDeltaVMps() <= 0.0) {
            return 0.0;
        }
        return Math.max(0.0, Math.min(1.0, currentVelocityMps / contract.getRequiredDeltaVMps()));
    }
}
