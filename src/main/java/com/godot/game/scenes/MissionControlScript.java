package com.godot.game.scenes;

import com.godot.game.core.AgencyState;
import com.godot.game.core.FlightSimulation;
import com.godot.game.core.MissionCatalog;
import com.godot.game.core.MissionContract;
import com.godot.game.core.PartCatalog;
import com.godot.game.core.PartCondition;
import com.godot.game.core.RocketBlueprint;
import com.godot.game.core.RocketPart;
import com.godot.game.core.RocketValidator;
import com.godot.game.core.ValidationResult;
import godot.annotation.Script;
import godot.api.Button;
import godot.api.ColorRect;
import godot.api.Control;
import godot.api.Label;
import godot.api.LabelSettings;
import godot.api.TextServer;
import godot.core.Color;
import godot.core.HorizontalAlignment;
import godot.core.LambdaCallable0;
import godot.core.Vector2;

import java.util.List;
import java.util.Locale;

/**
 * Main interactive Godot 2D controller for Earth Mission Control & the Vehicle Assembly Building (VAB).
 * Bridges the pure Java simulation core ({@link RocketBlueprint}, {@link RocketValidator}, {@link FlightSimulation})
 * with Godot's 2D UI and visual rocket launch shaft.
 */
@Script
public class MissionControlScript extends Control {

    // Core pure-Java domain state
    private final AgencyState agencyState = new AgencyState();
    private final RocketBlueprint blueprint = new RocketBlueprint();
    private FlightSimulation activeFlight = null;
    private boolean missionRewardClaimed = false;

    // Part selection indices & condition toggles
    private int payloadIndex = 0;
    private boolean payloadSurplus = false;

    private int upperStageIndex = 0; // 0 = None, 1..N = PartCatalog.getUpperStages()
    private boolean upperStageSurplus = false;

    private int boosterIndex = 0;
    private boolean boosterSurplus = false;

    private int engineIndex = 0;
    private boolean engineSurplus = false;

    // UI References — Top Bar
    private Label agencyHeaderLabel;

    // UI References — Left Column (Briefing)
    private Label missionCodeLabel;
    private Label missionTypeLabel;
    private Label missionBriefingLabel;
    private Label missionReqsLabel;

    // UI References — Center Column (Part Selectors)
    private Label payloadInfoLabel;
    private Button payloadConditionBtn;
    private Label upperStageInfoLabel;
    private Button upperStageConditionBtn;
    private Label boosterInfoLabel;
    private Button boosterConditionBtn;
    private Label engineInfoLabel;
    private Button engineConditionBtn;

    // UI References — Center Visual Launch Shaft
    private ColorRect skyBackgroundRect;
    private ColorRect starsOverlayRect;
    private Control rocketVisualRoot;
    private ColorRect noseConeRect;
    private ColorRect payloadBodyRect;
    private ColorRect upperStageBodyRect;
    private ColorRect boosterBodyRect;
    private ColorRect engineNozzleRect;
    private ColorRect exhaustFlameRect;
    private Label shaftTelemetryLabel;

    // UI References — Right Column (Telemetry & Controls)
    private Label budgetGaugeLabel;
    private ColorRect budgetBarFill;
    private Label timeGaugeLabel;
    private ColorRect timeBarFill;
    private Label twrGaugeLabel;
    private ColorRect twrBarFill;
    private Label deltaVGaugeLabel;
    private ColorRect deltaVBarFill;
    private Label reliabilityGaugeLabel;
    private Label diagnosticsTextLabel;

    private Button launchButton;
    private Button stageSepButton;
    private Button anomalyOverrideButton;
    private Button resetOrNextButton;

    @Override
    public void _ready() {
        buildUserInterface();
        syncBlueprintFromSelections();
        refreshAllUi();
    }

    @Override
    public void _process(double delta) {
        if (activeFlight == null) {
            return;
        }

        FlightSimulation.Phase prevPhase = activeFlight.getPhase();
        activeFlight.step(delta);
        FlightSimulation.Phase currentPhase = activeFlight.getPhase();

        if (currentPhase == FlightSimulation.Phase.ORBIT_ACHIEVED && !missionRewardClaimed) {
            missionRewardClaimed = true;
            agencyState.recordMissionSuccess(blueprint, MissionCatalog.getMission(selectedMissionIndex));
        }

        updateVisualFlightShaft(delta);
        if (prevPhase != currentPhase || activeFlight.isAnomalyActive()
                || currentPhase == FlightSimulation.Phase.STAGE_1_ASCENT
                || currentPhase == FlightSimulation.Phase.UPPER_STAGE_BURN) {
            refreshTelemetryAndFlightControls();
        }
    }

    private int selectedMissionIndex = 0;

    private MissionContract getActiveContract() {
        return MissionCatalog.getMission(selectedMissionIndex);
    }

    private void syncBlueprintFromSelections() {
        List<RocketPart> payloads = PartCatalog.getPayloads();
        RocketPart p = payloads.get(Math.floorMod(payloadIndex, payloads.size()));
        blueprint.setPayload(payloadSurplus ? p.asSurplus() : p);

        List<RocketPart> uppers = PartCatalog.getUpperStages();
        if (upperStageIndex <= 0) {
            blueprint.setUpperStage(null);
        } else {
            RocketPart u = uppers.get((upperStageIndex - 1) % uppers.size());
            blueprint.setUpperStage(upperStageSurplus ? u.asSurplus() : u);
        }

        List<RocketPart> boosters = PartCatalog.getBoosterTanks();
        RocketPart b = boosters.get(Math.floorMod(boosterIndex, boosters.size()));
        blueprint.setBoosterTank(boosterSurplus ? b.asSurplus() : b);

        List<RocketPart> engines = PartCatalog.getEngines();
        RocketPart e = engines.get(Math.floorMod(engineIndex, engines.size()));
        blueprint.setMainEngine(engineSurplus ? e.asSurplus() : e);
    }

    private void autoFitRecommendedBuild() {
        if (activeFlight != null) {
            activeFlight = null;
        }
        switch (selectedMissionIndex) {
            case 0 -> {
                payloadIndex = 0;
                payloadSurplus = false;
                upperStageIndex = 0;
                upperStageSurplus = false;
                boosterIndex = 0;
                boosterSurplus = false;
                engineIndex = 0;
                engineSurplus = false;
            }
            case 1 -> {
                payloadIndex = 1;
                payloadSurplus = true;
                upperStageIndex = 0;
                upperStageSurplus = false;
                boosterIndex = 0;
                boosterSurplus = true;
                engineIndex = 0;
                engineSurplus = true;
            }
            case 2 -> {
                payloadIndex = 2;
                payloadSurplus = false;
                upperStageIndex = 1;
                upperStageSurplus = false;
                boosterIndex = 1;
                boosterSurplus = true;
                engineIndex = 1;
                engineSurplus = true;
            }
            case 3 -> {
                payloadIndex = 3;
                payloadSurplus = true;
                upperStageIndex = 1;
                upperStageSurplus = false;
                boosterIndex = 1;
                boosterSurplus = true;
                engineIndex = 1;
                engineSurplus = false;
            }
            default -> {
                payloadIndex = 4;
                payloadSurplus = true;
                upperStageIndex = 2;
                upperStageSurplus = false;
                boosterIndex = 2;
                boosterSurplus = true;
                engineIndex = 2;
                engineSurplus = true;
            }
        }
        syncBlueprintFromSelections();
        refreshAllUi();
    }

    private void buildUserInterface() {
        // Full-screen dark slate background
        createPanel(this, 0, 0, 1280, 720, color(0.05, 0.07, 0.12, 1.0));

        // ================= TOP BAR =================
        createPanel(this, 0, 0, 1280, 56, color(0.08, 0.12, 0.22, 1.0));
        createPanel(this, 0, 54, 1280, 2, color(0.20, 0.45, 0.85, 1.0));

        createStyledLabel(
                this,
                "NASA: Capricorn",
                16, 8, 520, 22,
                16, color(0.45, 0.82, 1.0, 1.0)
        );
        agencyHeaderLabel = createStyledLabel(
                this,
                "",
                16, 30, 620, 20,
                12, color(0.80, 0.88, 0.96, 1.0)
        );

        createActionButton(this, "< Prev Mission", 760, 12, 140, 32, () -> {
            activeFlight = null;
            selectedMissionIndex = Math.max(0, selectedMissionIndex - 1);
            refreshAllUi();
        });
        createActionButton(this, "Next Mission >", 910, 12, 140, 32, () -> {
            activeFlight = null;
            selectedMissionIndex = Math.min(MissionCatalog.getAllMissions().size() - 1, selectedMissionIndex + 1);
            refreshAllUi();
        });
        createActionButton(this, "Auto-Fit Valid Build", 1065, 12, 195, 32, this::autoFitRecommendedBuild);

        // ================= LEFT COLUMN: MISSION BRIEFING =================
        createPanel(this, 14, 68, 356, 638, color(0.08, 0.11, 0.18, 1.0));
        createPanel(this, 14, 68, 356, 34, color(0.12, 0.18, 0.30, 1.0));
        createStyledLabel(this, "1. ACTIVE MISSION DIRECTIVE", 26, 75, 330, 22, 14, color(0.95, 0.78, 0.25, 1.0));

        missionCodeLabel = createStyledLabel(this, "", 26, 112, 332, 26, 16, color(1.0, 1.0, 1.0, 1.0));
        missionTypeLabel = createStyledLabel(this, "", 26, 138, 332, 22, 13, color(0.35, 0.85, 1.0, 1.0));

        missionBriefingLabel = createWrappedLabel(this, "", 26, 168, 332, 155, 13, color(0.84, 0.88, 0.94, 1.0));

        createPanel(this, 24, 330, 336, 360, color(0.06, 0.09, 0.14, 1.0));
        createStyledLabel(this, "CONTRACT CONSTRAINTS & TARGETS", 34, 340, 316, 22, 13, color(0.45, 0.82, 1.0, 1.0));
        missionReqsLabel = createWrappedLabel(this, "", 34, 368, 316, 310, 13, color(0.90, 0.94, 0.98, 1.0));

        // ================= CENTER COLUMN: VAB & 2D LAUNCH SHAFT =================
        createPanel(this, 382, 68, 504, 638, color(0.08, 0.11, 0.18, 1.0));
        createPanel(this, 382, 68, 504, 34, color(0.12, 0.18, 0.30, 1.0));
        createStyledLabel(this, "2. VEHICLE ASSEMBLY BAY (VAB) & LAUNCH PAD", 394, 75, 480, 22, 14, color(0.95, 0.78, 0.25, 1.0));

        // 4 Modular Part Selector Cards on the left side of Center Column (x=392..676)
        buildPartSelectorCard(
                "SLOT A: PAYLOAD / CAPSULE",
                392, 112,
                () -> {
                    payloadIndex--;
                    onAssemblyModified();
                },
                () -> {
                    payloadIndex++;
                    onAssemblyModified();
                },
                () -> {
                    payloadSurplus = !payloadSurplus;
                    onAssemblyModified();
                },
                0
        );

        buildPartSelectorCard(
                "SLOT B: UPPER STAGE (OPTIONAL)",
                392, 256,
                () -> {
                    int count = PartCatalog.getUpperStages().size() + 1;
                    upperStageIndex = Math.floorMod(upperStageIndex - 1, count);
                    onAssemblyModified();
                },
                () -> {
                    int count = PartCatalog.getUpperStages().size() + 1;
                    upperStageIndex = Math.floorMod(upperStageIndex + 1, count);
                    onAssemblyModified();
                },
                () -> {
                    upperStageSurplus = !upperStageSurplus;
                    onAssemblyModified();
                },
                1
        );

        buildPartSelectorCard(
                "SLOT C: FIRST-STAGE BOOSTER TANK",
                392, 400,
                () -> {
                    boosterIndex--;
                    onAssemblyModified();
                },
                () -> {
                    boosterIndex++;
                    onAssemblyModified();
                },
                () -> {
                    boosterSurplus = !boosterSurplus;
                    onAssemblyModified();
                },
                2
        );

        buildPartSelectorCard(
                "SLOT D: MAIN LAUNCH ENGINE",
                392, 544,
                () -> {
                    engineIndex--;
                    onAssemblyModified();
                },
                () -> {
                    engineIndex++;
                    onAssemblyModified();
                },
                () -> {
                    engineSurplus = !engineSurplus;
                    onAssemblyModified();
                },
                3
        );

        // 2D Visual Rocket & Launch Shaft on right side of Center Column (x=688, y=112, w=188, h=580)
        skyBackgroundRect = createPanel(this, 688, 112, 188, 580, color(0.10, 0.24, 0.44, 1.0));
        starsOverlayRect = createPanel(this, 688, 112, 188, 220, color(0.02, 0.03, 0.08, 0.65));

        // Ground pad & launch gantry tower
        createPanel(this, 688, 652, 188, 40, color(0.18, 0.22, 0.26, 1.0));
        createPanel(this, 706, 360, 12, 292, color(0.32, 0.36, 0.42, 1.0)); // Gantry mast
        createPanel(this, 718, 420, 36, 6, color(0.32, 0.36, 0.42, 1.0));   // Umbilical arm

        shaftTelemetryLabel = createWrappedLabel(this, "", 694, 118, 176, 86, 11, color(0.85, 0.95, 1.0, 1.0));

        // Rocket Visual Container (moves up during launch!)
        rocketVisualRoot = new Control();
        rocketVisualRoot.setPosition(new Vector2(745, 360));
        rocketVisualRoot.setSize(new Vector2(90, 290));
        addChild(rocketVisualRoot);

        noseConeRect = createPanel(rocketVisualRoot, 27, 20, 36, 26, color(0.92, 0.94, 0.98, 1.0));
        payloadBodyRect = createPanel(rocketVisualRoot, 21, 46, 48, 46, color(0.20, 0.62, 0.92, 1.0));
        upperStageBodyRect = createPanel(rocketVisualRoot, 23, 94, 44, 52, color(0.82, 0.86, 0.92, 1.0));
        boosterBodyRect = createPanel(rocketVisualRoot, 17, 148, 56, 112, color(0.90, 0.92, 0.95, 1.0));
        engineNozzleRect = createPanel(rocketVisualRoot, 27, 260, 36, 24, color(0.28, 0.32, 0.38, 1.0));
        exhaustFlameRect = createPanel(rocketVisualRoot, 31, 284, 28, 48, color(1.0, 0.55, 0.10, 0.0));

        // ================= RIGHT COLUMN: TELEMETRY & LAUNCH CONTROL =================
        createPanel(this, 898, 68, 368, 638, color(0.08, 0.11, 0.18, 1.0));
        createPanel(this, 898, 68, 368, 34, color(0.12, 0.18, 0.30, 1.0));
        createStyledLabel(this, "3. TELEMETRY, BUDGET & LAUNCH DECK", 910, 75, 345, 22, 14, color(0.95, 0.78, 0.25, 1.0));

        // Gauge 1: Budget
        budgetGaugeLabel = createStyledLabel(this, "", 912, 112, 340, 20, 13, color(1.0, 1.0, 1.0, 1.0));
        createPanel(this, 912, 134, 340, 12, color(0.15, 0.18, 0.24, 1.0));
        budgetBarFill = createPanel(this, 912, 134, 170, 12, color(0.20, 0.85, 0.45, 1.0));

        // Gauge 2: Prep Time
        timeGaugeLabel = createStyledLabel(this, "", 912, 156, 340, 20, 13, color(1.0, 1.0, 1.0, 1.0));
        createPanel(this, 912, 178, 340, 12, color(0.15, 0.18, 0.24, 1.0));
        timeBarFill = createPanel(this, 912, 178, 170, 12, color(0.20, 0.85, 0.45, 1.0));

        // Gauge 3: Launch TWR
        twrGaugeLabel = createStyledLabel(this, "", 912, 200, 340, 20, 13, color(1.0, 1.0, 1.0, 1.0));
        createPanel(this, 912, 222, 340, 12, color(0.15, 0.18, 0.24, 1.0));
        twrBarFill = createPanel(this, 912, 222, 170, 12, color(0.20, 0.85, 0.45, 1.0));

        // Gauge 4: Total Delta-V
        deltaVGaugeLabel = createStyledLabel(this, "", 912, 244, 340, 20, 13, color(1.0, 1.0, 1.0, 1.0));
        createPanel(this, 912, 266, 340, 12, color(0.15, 0.18, 0.24, 1.0));
        deltaVBarFill = createPanel(this, 912, 266, 170, 12, color(0.20, 0.85, 0.45, 1.0));

        // Gauge 5: Reliability & Mass Summary
        reliabilityGaugeLabel = createStyledLabel(this, "", 912, 288, 340, 22, 13, color(0.85, 0.90, 0.98, 1.0));

        // Diagnostics & Flight Log Box
        createPanel(this, 910, 318, 344, 195, color(0.05, 0.08, 0.13, 1.0));
        createStyledLabel(this, "ENGINEERING & FLIGHT TELEMETRY LOG", 920, 324, 324, 20, 12, color(0.45, 0.82, 1.0, 1.0));
        diagnosticsTextLabel = createWrappedLabel(this, "", 920, 348, 324, 158, 12, color(0.90, 0.95, 0.90, 1.0));

        // Action Buttons
        launchButton = createActionButton(this, "COMMIT & LAUNCH ROCKET", 910, 524, 344, 42, this::onLaunchPressed);
        stageSepButton = createActionButton(this, "STAGE SEPARATION (IGNITE UPPER STAGE)", 910, 572, 344, 38, this::onStageSepPressed);
        anomalyOverrideButton = createActionButton(this, "OVERRIDE ANOMALY (PURGE VALVES)", 910, 616, 344, 38, this::onAnomalyOverridePressed);
        resetOrNextButton = createActionButton(this, "RESET PAD / ADVANCE MISSION", 910, 660, 344, 36, this::onResetOrNextPressed);
    }

    private void buildPartSelectorCard(
            String slotTitle,
            double x,
            double y,
            Runnable onPrev,
            Runnable onNext,
            Runnable onToggleCondition,
            int slotIndex) {
        createPanel(this, x, y, 284, 134, color(0.06, 0.09, 0.15, 1.0));
        createStyledLabel(this, slotTitle, x + 10, y + 6, 264, 18, 12, color(0.45, 0.82, 1.0, 1.0));

        Label infoLabel = createWrappedLabel(this, "", x + 10, y + 26, 264, 66, 12, color(0.92, 0.95, 1.0, 1.0));

        createActionButton(this, "<", x + 10, y + 96, 38, 30, onPrev);
        createActionButton(this, ">", x + 54, y + 96, 38, 30, onNext);
        Button condBtn = createActionButton(this, "Condition: NEW", x + 100, y + 96, 174, 30, onToggleCondition);

        switch (slotIndex) {
            case 0 -> {
                payloadInfoLabel = infoLabel;
                payloadConditionBtn = condBtn;
            }
            case 1 -> {
                upperStageInfoLabel = infoLabel;
                upperStageConditionBtn = condBtn;
            }
            case 2 -> {
                boosterInfoLabel = infoLabel;
                boosterConditionBtn = condBtn;
            }
            default -> {
                engineInfoLabel = infoLabel;
                engineConditionBtn = condBtn;
            }
        }
    }

    private void onAssemblyModified() {
        if (activeFlight != null) {
            activeFlight = null;
        }
        syncBlueprintFromSelections();
        refreshAllUi();
    }

    private void onLaunchPressed() {
        MissionContract contract = getActiveContract();
        ValidationResult validation = RocketValidator.validate(blueprint, contract);
        if (!validation.isValidForMission()) {
            refreshAllUi();
            return;
        }
        missionRewardClaimed = false;
        activeFlight = new FlightSimulation(blueprint, contract);
        activeFlight.startLaunch();
        refreshAllUi();
    }

    private void onStageSepPressed() {
        if (activeFlight != null) {
            activeFlight.triggerStageSeparation();
            refreshTelemetryAndFlightControls();
        }
    }

    private void onAnomalyOverridePressed() {
        if (activeFlight != null) {
            activeFlight.resolveAnomaly();
            refreshTelemetryAndFlightControls();
        }
    }

    private void onResetOrNextPressed() {
        if (activeFlight != null && activeFlight.getPhase() == FlightSimulation.Phase.ORBIT_ACHIEVED) {
            selectedMissionIndex = agencyState.getCurrentMissionIndex();
        }
        activeFlight = null;
        syncBlueprintFromSelections();
        refreshAllUi();
    }

    private void refreshAllUi() {
        MissionContract contract = getActiveContract();

        // Top Bar
        agencyHeaderLabel.setText(String.format(
                Locale.US,
                "Campaign: %d/%d Completed  |  Astronauts Rescued: %d  |  Cargo Delivered: %,.0f kg  |  Agency Reserve: $%,d",
                agencyState.getMissionsCompleted(),
                MissionCatalog.getAllMissions().size(),
                agencyState.getTotalAstronautsRescued(),
                agencyState.getTotalCargoDeliveredKg(),
                agencyState.getReserveFundsDollars()
        ));

        // Left Column (Mission Briefing)
        missionCodeLabel.setText(String.format(
                Locale.US,
                "[%d/%d] %s",
                selectedMissionIndex + 1,
                MissionCatalog.getAllMissions().size(),
                contract.getCodeName()
        ));
        missionTypeLabel.setText("CATEGORY: " + contract.getMissionType().getDisplayName().toUpperCase(Locale.US));
        missionBriefingLabel.setText(contract.getBriefing());

        StringBuilder reqs = new StringBuilder();
        reqs.append(String.format(Locale.US, "• Required Payload: %s\n", contract.getRequiredPayloadType().getDisplayName()));
        if (contract.getMinCrewCapacity() > 0) {
            reqs.append(String.format(Locale.US, "• Min Rescue Seats: %d Astronauts\n", contract.getMinCrewCapacity()));
        }
        if (contract.getMinCargoMassKg() > 0) {
            reqs.append(String.format(Locale.US, "• Min Cargo Capacity: %,.0f kg\n", contract.getMinCargoMassKg()));
        }
        reqs.append(String.format(Locale.US, "• Target Orbit Altitude: %,.0f km\n", contract.getTargetAltitudeKm()));
        reqs.append(String.format(Locale.US, "• Required Orbit Delta-V: %,.0f m/s\n\n", contract.getRequiredDeltaVMps()));
        reqs.append(String.format(Locale.US, "• STRICT BUDGET CAP: $%,d\n", contract.getBudgetLimitDollars()));
        reqs.append(String.format(Locale.US, "• LAUNCH WINDOW DEADLINE: %d Days\n", contract.getDeadlineDays()));
        reqs.append(String.format(Locale.US, "• Completion Funding Grant: $%,d\n\n", contract.getRewardDollars()));
        reqs.append("TIP: Toggle [SURPLUS] on parts to cut cost by 45% and prep time by 50%, or click [Auto-Fit Valid Build] in the top-right!");
        missionReqsLabel.setText(reqs.toString());

        // Center Column (Part Selector Cards)
        RocketPart p = blueprint.getPayload();
        payloadInfoLabel.setText(String.format(
                Locale.US,
                "%s\nCost: $%,d  |  Prep: %d d  |  Mass: %,.0f kg\nSeats: %d  |  Cargo: %,.0f kg",
                p.getName(),
                p.getCostDollars(),
                p.getPrepDays(),
                p.getWetMassKg(),
                p.getCrewCapacity(),
                p.getCargoCapacityKg()
        ));
        payloadConditionBtn.setText(p.getCondition() == PartCondition.SURPLUS_REFURBISHED ? "Mode: SURPLUS (45% Off)" : "Mode: FACTORY NEW");

        RocketPart u = blueprint.getUpperStage();
        if (u == null) {
            upperStageInfoLabel.setText("None (Single-Stage Configuration)\nCost: $0  |  Prep: 0 d  |  Mass: 0 kg\nAdd an upper stage for high-Delta-V orbits!");
            upperStageConditionBtn.setText("No Upper Stage");
            upperStageConditionBtn.setDisabled(true);
        } else {
            upperStageInfoLabel.setText(String.format(
                    Locale.US,
                    "%s\nCost: $%,d  |  Prep: %d d  |  Isp: %.0f s\nWet: %,.0f kg  |  Stage 2 dV: +%,.0f m/s",
                    u.getName(),
                    u.getCostDollars(),
                    u.getPrepDays(),
                    u.getIspSeconds(),
                    u.getWetMassKg(),
                    blueprint.getUpperStageDeltaVMps()
            ));
            upperStageConditionBtn.setDisabled(false);
            upperStageConditionBtn.setText(u.getCondition() == PartCondition.SURPLUS_REFURBISHED ? "Mode: SURPLUS (45% Off)" : "Mode: FACTORY NEW");
        }

        RocketPart b = blueprint.getBoosterTank();
        boosterInfoLabel.setText(String.format(
                Locale.US,
                "%s\nCost: $%,d  |  Prep: %d d\nFuel: %,.0f kg  |  Dry: %,.0f kg",
                b.getName(),
                b.getCostDollars(),
                b.getPrepDays(),
                b.getFuelMassKg(),
                b.getDryMassKg()
        ));
        boosterConditionBtn.setText(b.getCondition() == PartCondition.SURPLUS_REFURBISHED ? "Mode: SURPLUS (45% Off)" : "Mode: FACTORY NEW");

        RocketPart e = blueprint.getMainEngine();
        engineInfoLabel.setText(String.format(
                Locale.US,
                "%s\nCost: $%,d  |  Prep: %d d\nThrust: %,.0f kN  |  Isp: %.0f s",
                e.getName(),
                e.getCostDollars(),
                e.getPrepDays(),
                e.getThrustKn(),
                e.getIspSeconds()
        ));
        engineConditionBtn.setText(e.getCondition() == PartCondition.SURPLUS_REFURBISHED ? "Mode: SURPLUS (45% Off)" : "Mode: FACTORY NEW");

        updateVisualRocketAppearance();
        updateVisualFlightShaft(0.0);
        refreshTelemetryAndFlightControls();
    }

    private void updateVisualRocketAppearance() {
        RocketPart p = blueprint.getPayload();
        RocketPart u = blueprint.getUpperStage();
        RocketPart b = blueprint.getBoosterTank();
        RocketPart e = blueprint.getMainEngine();

        // Color-code payload by mission role and surplus status
        if (p.getCondition() == PartCondition.SURPLUS_REFURBISHED) {
            payloadBodyRect.setColor(color(0.76, 0.52, 0.22, 1.0));
        } else {
            payloadBodyRect.setColor(color(0.22, 0.62, 0.94, 1.0));
        }

        if (u == null) {
            upperStageBodyRect.setVisible(false);
        } else {
            upperStageBodyRect.setVisible(true);
            upperStageBodyRect.setColor(
                    u.getCondition() == PartCondition.SURPLUS_REFURBISHED
                            ? color(0.68, 0.55, 0.32, 1.0)
                            : color(0.82, 0.86, 0.94, 1.0)
            );
        }

        boosterBodyRect.setVisible(true);
        boosterBodyRect.setColor(
                b.getCondition() == PartCondition.SURPLUS_REFURBISHED
                        ? color(0.62, 0.48, 0.30, 1.0)
                        : color(0.90, 0.92, 0.96, 1.0)
        );

        engineNozzleRect.setVisible(true);
        engineNozzleRect.setColor(
                e.getCondition() == PartCondition.SURPLUS_REFURBISHED
                        ? color(0.48, 0.34, 0.22, 1.0)
                        : color(0.30, 0.34, 0.42, 1.0)
        );
    }

    private void updateVisualFlightShaft(double delta) {
        if (activeFlight == null) {
            rocketVisualRoot.setPosition(new Vector2(745, 368));
            exhaustFlameRect.setColor(color(1.0, 0.55, 0.10, 0.0));
            skyBackgroundRect.setColor(color(0.10, 0.24, 0.44, 1.0));
            shaftTelemetryLabel.setText(String.format(
                    Locale.US,
                    "PAD STATUS: STANDBY\nWet Mass: %,.0f kg\nStages: %d\nSurplus Parts: %d",
                    blueprint.getTotalWetMassKg(),
                    blueprint.getUpperStage() != null ? 2 : 1,
                    blueprint.getSurplusPartCount()
            ));
            return;
        }

        double progress = activeFlight.getOverallProgressRatio();
        // Darken sky from atmospheric blue to space black as rocket climbs
        double r = 0.10 * (1.0 - progress) + 0.01 * progress;
        double g = 0.24 * (1.0 - progress) + 0.02 * progress;
        double b = 0.44 * (1.0 - progress) + 0.06 * progress;
        skyBackgroundRect.setColor(color(r, g, b, 1.0));

        // Elevate rocket visual from y=368 up to y=160
        double rocketY = 368.0 - (progress * 195.0);
        rocketVisualRoot.setPosition(new Vector2(745, rocketY));

        // Hide Stage 1 booster once Stage 2 is burning
        FlightSimulation.Phase phase = activeFlight.getPhase();
        boolean stage1Attached = phase == FlightSimulation.Phase.PRE_LAUNCH
                || phase == FlightSimulation.Phase.STAGE_1_ASCENT
                || phase == FlightSimulation.Phase.AWAITING_STAGE_SEP;
        boosterBodyRect.setVisible(stage1Attached);
        engineNozzleRect.setVisible(stage1Attached);

        // Animate exhaust plume during active burns
        boolean burning = phase == FlightSimulation.Phase.STAGE_1_ASCENT
                || phase == FlightSimulation.Phase.UPPER_STAGE_BURN;
        if (burning) {
            double flicker = 0.75 + 0.25 * Math.sin(activeFlight.getElapsedSeconds() * 28.0);
            exhaustFlameRect.setPosition(new Vector2(31, stage1Attached ? 284 : 146));
            exhaustFlameRect.setColor(color(1.0, 0.60 * flicker, 0.12, 0.95));
        } else {
            exhaustFlameRect.setColor(color(1.0, 0.55, 0.10, 0.0));
        }

        shaftTelemetryLabel.setText(String.format(
                Locale.US,
                "%s\nT+%.1fs\nAlt: %,.0f / %,.0f km\ndV: %,.0f / %,.0f m/s",
                phase.getDisplayName(),
                activeFlight.getElapsedSeconds(),
                activeFlight.getCurrentAltitudeKm(),
                getActiveContract().getTargetAltitudeKm(),
                activeFlight.getCurrentVelocityMps(),
                getActiveContract().getRequiredDeltaVMps()
        ));
    }

    private void refreshTelemetryAndFlightControls() {
        MissionContract contract = getActiveContract();
        ValidationResult validation = RocketValidator.validate(blueprint, contract);

        // 1. Budget Bar
        long cost = blueprint.getTotalCostDollars();
        long maxBudget = contract.getBudgetLimitDollars();
        budgetGaugeLabel.setText(String.format(Locale.US, "BUDGET: $%,d / $%,d", cost, maxBudget));
        updateBar(budgetBarFill, (double) cost / Math.max(1L, maxBudget), validation.isWithinBudget());

        // 2. Prep Time Bar
        int days = blueprint.getTotalPrepDays();
        int maxDays = contract.getDeadlineDays();
        timeGaugeLabel.setText(String.format(Locale.US, "PREP TIME: %d Days / %d Days Window", days, maxDays));
        updateBar(timeBarFill, (double) days / Math.max(1, maxDays), validation.isWithinDeadline());

        // 3. Launch TWR Bar
        double twr = blueprint.getLaunchTwr();
        twrGaugeLabel.setText(String.format(Locale.US, "LAUNCH TWR: %.2f (Min %.2f)", twr, RocketBlueprint.MIN_SAFE_LAUNCH_TWR));
        updateBar(twrBarFill, Math.min(1.0, twr / 2.2), validation.isSufficientTwr());

        // 4. Delta-V Bar
        double dv = blueprint.getTotalDeltaVMps();
        double reqDv = contract.getRequiredDeltaVMps();
        deltaVGaugeLabel.setText(String.format(Locale.US, "TOTAL DELTA-V: %,.0f / %,.0f m/s", dv, reqDv));
        updateBar(deltaVBarFill, Math.min(1.0, dv / Math.max(1.0, reqDv)), validation.isSufficientDeltaV());

        // 5. Reliability & Mass
        reliabilityGaugeLabel.setText(String.format(
                Locale.US,
                "RELIABILITY: %.0f%%  |  Surplus Parts: %d  |  Wet Mass: %,.0f kg",
                blueprint.getCombinedReliability() * 100.0,
                blueprint.getSurplusPartCount(),
                blueprint.getTotalWetMassKg()
        ));

        if (activeFlight == null) {
            StringBuilder diag = new StringBuilder();
            if (validation.isValidForMission()) {
                diag.append("[GO FOR LAUNCH] All engineering, budget, and countdown constraints satisfied!\n");
            } else {
                for (String err : validation.getErrors()) {
                    diag.append("• ").append(err).append("\n");
                }
            }
            for (String warn : validation.getWarnings()) {
                diag.append("• ").append(warn).append("\n");
            }
            diagnosticsTextLabel.setText(diag.toString());

            launchButton.setDisabled(!validation.isValidForMission());
            launchButton.setText(validation.isValidForMission() ? "COMMIT & LAUNCH ROCKET" : "CANNOT LAUNCH — FIX ERRORS ABOVE");
            stageSepButton.setDisabled(true);
            anomalyOverrideButton.setDisabled(true);
            resetOrNextButton.setText("RESET ASSEMBLY PAD");
        } else {
            FlightSimulation.Phase phase = activeFlight.getPhase();
            StringBuilder flightLog = new StringBuilder();
            flightLog.append("PHASE: ").append(phase.getDisplayName()).append("\n");
            flightLog.append(String.format(
                    Locale.US,
                    "Stage 1 Propellant: %.0f%%  |  Stage 2 Propellant: %.0f%%\n",
                    activeFlight.getStage1FuelRemainingRatio() * 100.0,
                    activeFlight.getStage2FuelRemainingRatio() * 100.0
            ));
            if (activeFlight.isAnomalyActive()) {
                flightLog.append(String.format(
                        Locale.US,
                        "\n>>> EMERGENCY (%.1fs left): %s\n",
                        activeFlight.getAnomalyCountdownSeconds(),
                        activeFlight.getActiveAnomalyMessage()
                ));
            } else {
                flightLog.append("\nLOG: ").append(activeFlight.getStatusLog()).append("\n");
            }
            diagnosticsTextLabel.setText(flightLog.toString());

            launchButton.setDisabled(true);
            stageSepButton.setDisabled(phase != FlightSimulation.Phase.AWAITING_STAGE_SEP);
            anomalyOverrideButton.setDisabled(!activeFlight.isAnomalyActive());

            if (phase == FlightSimulation.Phase.ORBIT_ACHIEVED) {
                resetOrNextButton.setText("MISSION COMPLETE — ADVANCE TO NEXT MISSION >>");
            } else if (phase == FlightSimulation.Phase.MISSION_ABORTED) {
                resetOrNextButton.setText("RETRY MISSION ON LAUNCH PAD");
            } else {
                resetOrNextButton.setText("ABORT & RETURN TO VAB");
            }
        }
    }

    private void updateBar(ColorRect barFill, double ratio, boolean isOk) {
        double clamped = Math.max(0.04, Math.min(1.0, ratio));
        barFill.setSize(new Vector2(340.0 * clamped, 12.0));
        barFill.setColor(isOk ? color(0.20, 0.82, 0.45, 1.0) : color(0.92, 0.25, 0.25, 1.0));
    }

    // ================= UI FACTORY HELPERS =================

    private static Color color(double r, double g, double b, double a) {
        return new Color(r, g, b, a);
    }

    private static ColorRect createPanel(Control parent, double x, double y, double w, double h, Color bgColor) {
        ColorRect rect = new ColorRect();
        rect.setPosition(new Vector2(x, y));
        rect.setSize(new Vector2(w, h));
        rect.setColor(bgColor);
        parent.addChild(rect);
        return rect;
    }

    private static Label createStyledLabel(
            Control parent,
            String text,
            double x,
            double y,
            double w,
            double h,
            int fontSize,
            Color fontColor) {
        Label label = new Label();
        label.setPosition(new Vector2(x, y));
        label.setSize(new Vector2(w, h));
        label.setText(text);

        LabelSettings settings = new LabelSettings();
        settings.setFontSize(fontSize);
        settings.setFontColor(fontColor);
        label.setLabelSettings(settings);

        parent.addChild(label);
        return label;
    }

    private static Label createWrappedLabel(
            Control parent,
            String text,
            double x,
            double y,
            double w,
            double h,
            int fontSize,
            Color fontColor) {
        Label label = createStyledLabel(parent, text, x, y, w, h, fontSize, fontColor);
        label.setAutowrapMode(TextServer.AutowrapMode.WORD_SMART);
        return label;
    }

    private static Button createActionButton(
            Control parent,
            String text,
            double x,
            double y,
            double w,
            double h,
            Runnable onClick) {
        Button btn = new Button();
        btn.setPosition(new Vector2(x, y));
        btn.setSize(new Vector2(w, h));
        btn.setText(text);
        btn.setTextAlignment(HorizontalAlignment.CENTER);
        btn.getPressed().connect(LambdaCallable0.create(onClick::run));
        parent.addChild(btn);
        return btn;
    }
}
