package com.godot.game.scenes;

import com.godot.game.core.AgencyState;
import com.godot.game.core.FlightSimulation;
import com.godot.game.core.MissionCatalog;
import com.godot.game.core.MissionContract;
import com.godot.game.core.PartCatalog;
import com.godot.game.core.PartCategory;
import com.godot.game.core.PartCondition;
import com.godot.game.core.PayloadType;
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
import godot.api.Line2D;
import godot.api.Polygon2D;
import godot.api.TextServer;
import godot.core.Color;
import godot.core.HorizontalAlignment;
import godot.core.LambdaCallable0;
import godot.core.PackedVector2Array;
import godot.core.Vector2;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Tactical Vehicle Assembly Building (VAB) & Mission Control scene controller.
 * Matches user reference wireframes: 5-region left sidebar with 2-column loadout grid,
 * top/bottom telemetry bars, technical blueprint dimension frame, and a seamless 3-section
 * vector rocket (Payload > Fuel/Booster Tanks [with zero-gap optional Upper Stage] > Engines).
 */
@Script
public class MissionControlScript extends Control {

    // Theme Palette (Tactical Dark Aerospace)
    private static final Color COLOR_BG_DEEP = new Color(0.04, 0.05, 0.07, 1.0);
    private static final Color COLOR_PANEL_BG = new Color(0.08, 0.09, 0.13, 1.0);
    private static final Color COLOR_PANEL_BORDER = new Color(0.18, 0.22, 0.30, 1.0);
    private static final Color COLOR_CARD_DEFAULT_HEADER = new Color(0.16, 0.18, 0.24, 1.0);

    private static final Color COLOR_LIME_ACCENT = new Color(0.70, 1.0, 0.0, 1.0);      // #B4FF00
    private static final Color COLOR_AMBER_ACCENT = new Color(1.0, 0.62, 0.11, 1.0);    // Surplus Orange
    private static final Color COLOR_CYAN_ACCENT = new Color(0.35, 0.82, 1.0, 1.0);     // Tech Cyan
    private static final Color COLOR_WHITE_TEXT = new Color(0.95, 0.96, 0.98, 1.0);
    private static final Color COLOR_MUTED_TEXT = new Color(0.60, 0.65, 0.75, 1.0);
    private static final Color COLOR_DARK_TEXT = new Color(0.06, 0.07, 0.10, 1.0);
    private static final Color COLOR_ERROR_RED = new Color(0.95, 0.25, 0.25, 1.0);

    // Core Domain Models
    private final AgencyState agencyState = new AgencyState();
    private final RocketBlueprint blueprint = new RocketBlueprint();
    private FlightSimulation activeFlight = null;
    private boolean missionRewardClaimed = false;
    private int selectedMissionIndex = 0;

    // UI Navigation State
    private int selectedCategoryTab = 0; // 0 = PAYLOAD, 1 = TANKS, 2 = ENGINES
    private RocketPart inspectedPart = null;

    // Selections
    private int payloadIndex = 0;
    private boolean payloadSurplus = false;

    private int upperStageIndex = 0; // 0 = NONE, 1..N = Upper stages
    private boolean upperStageSurplus = false;

    private int boosterIndex = 0;
    private boolean boosterSurplus = false;

    private int engineIndex = 0;
    private boolean engineSurplus = false;

    // UI Nodes — Top Bar
    private Label topAgencyStatsLabel;

    // UI Nodes — Left Sidebar Region 1 (Mission Directive)
    private Label missionCodeLabel;
    private Label missionSummaryLabel;

    // UI Nodes — Left Sidebar Region 2 (Inspector & Condition Toggle)
    private Label inspectorTitleLabel;
    private Label inspectorStatsLabel;
    private Button inspectorConditionToggleBtn;

    // UI Nodes — Left Sidebar Region 3 (Category Tabs)
    private final Button[] categoryTabButtons = new Button[3];

    // UI Nodes — Left Sidebar Region 4 (2-Column Grid Container)
    private Control gridCardsContainer;
    private final List<Control> dynamicCardNodes = new ArrayList<>();

    // UI Nodes — Left Sidebar Region 5 (Launch Action)
    private Button launchOrFlightActionButton;
    private Button secondaryFlightActionButton;

    // UI Nodes — Bottom Bar
    private Label bottomStatsLeftLabel;
    private Label bottomStatsRightLabel;

    // UI Nodes — Right Viewport & Blueprint Dimension Frame
    private ColorRect viewportSkyRect;
    private Label dimensionTopLabel;
    private Label dimensionHeightLabel;
    private Label dimensionPadLabel;
    private Label viewportTelemetryOverlay;

    // Visual Rocket Nodes
    private Control rocketRootContainer;
    private Control payloadVisualContainer;
    private Control upperStageVisualContainer;
    private Control boosterVisualContainer;
    private Control engineVisualContainer;
    private Control exhaustPlumeContainer;

    @Override
    public void _ready() {
        buildTacticalLayout();
        syncBlueprintFromSelections();
        inspectedPart = blueprint.getPayload();
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

        updateRocketFlightAnimation(delta);

        if (prevPhase != currentPhase || activeFlight.isAnomalyActive()
                || currentPhase == FlightSimulation.Phase.STAGE_1_ASCENT
                || currentPhase == FlightSimulation.Phase.UPPER_STAGE_BURN) {
            refreshLaunchButtonsAndLog();
            refreshBottomTelemetryBar();
        }
    }

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

    // =========================================================================
    // UI LAYOUT GENERATION
    // =========================================================================

    private void buildTacticalLayout() {
        // Fullscreen backdrop
        createBox(this, 0, 0, 1280, 720, COLOR_BG_DEEP, null);

        // ---------------- TOP BAR (y: 0..42) ----------------
        createBox(this, 0, 0, 1280, 42, COLOR_PANEL_BG, COLOR_PANEL_BORDER);
        createLabel(this, "BUILDER // VAB", 16, 10, 160, 22, 13, COLOR_LIME_ACCENT);

        topAgencyStatsLabel = createLabel(this, "", 180, 11, 620, 22, 12, COLOR_WHITE_TEXT);

        createBtn(this, "< PREV", 920, 6, 95, 30, () -> {
            activeFlight = null;
            selectedMissionIndex = Math.max(0, selectedMissionIndex - 1);
            refreshAllUi();
        });
        createBtn(this, "NEXT >", 1022, 6, 95, 30, () -> {
            activeFlight = null;
            selectedMissionIndex = Math.min(MissionCatalog.getAllMissions().size() - 1, selectedMissionIndex + 1);
            refreshAllUi();
        });
        createBtn(this, "[ AUTO-FIT ]", 1124, 6, 140, 30, this::autoFitCurrentMission);

        // ---------------- LEFT SIDEBAR (x: 16..426, y: 48..672, w: 410, h: 624) ----------------
        buildLeftSidebar();

        // ---------------- RIGHT VIEWPORT (x: 436..1264, y: 48..672, w: 828, h: 624) ----------------
        buildRightRocketViewport();

        // ---------------- BOTTOM BAR (y: 678..720) ----------------
        createBox(this, 0, 678, 1280, 42, COLOR_PANEL_BG, COLOR_PANEL_BORDER);
        bottomStatsLeftLabel = createLabel(this, "", 20, 688, 560, 22, 12, COLOR_WHITE_TEXT);
        bottomStatsRightLabel = createLabel(this, "", 600, 688, 660, 22, 12, COLOR_CYAN_ACCENT);
        bottomStatsRightLabel.setHorizontalAlignment(HorizontalAlignment.RIGHT);
    }

    private void buildLeftSidebar() {
        double x = 16;
        double w = 410;

        // Box 1: Mission Directive Header (y: 48..118, h: 70)
        createBox(this, x, 48, w, 70, COLOR_PANEL_BG, COLOR_PANEL_BORDER);
        createLabel(this, "// MISSION DIRECTIVE //", x + 12, 54, w - 24, 18, 11, COLOR_CYAN_ACCENT);
        missionCodeLabel = createLabel(this, "", x + 12, 72, w - 24, 22, 13, COLOR_WHITE_TEXT);
        missionSummaryLabel = createLabel(this, "", x + 12, 94, w - 24, 18, 11, COLOR_MUTED_TEXT);

        // Box 2: Part Inspector & Condition Toggle (y: 124..232, h: 108)
        createBox(this, x, 124, w, 108, COLOR_PANEL_BG, COLOR_PANEL_BORDER);
        createLabel(this, "// PART INSPECTOR //", x + 12, 130, 200, 18, 11, COLOR_CYAN_ACCENT);
        inspectorTitleLabel = createLabel(this, "", x + 12, 148, w - 24, 20, 13, COLOR_WHITE_TEXT);
        inspectorStatsLabel = createWrappedLabel(this, "", x + 12, 168, w - 24, 34, 11, COLOR_MUTED_TEXT);

        inspectorConditionToggleBtn = createBtn(this, "CONDITION: FACTORY NEW", x + 12, 200, w - 24, 26, this::toggleInspectedCondition);

        // Box 3: Parts Category Selector (y: 238..276, h: 38)
        createBox(this, x, 238, w, 38, COLOR_PANEL_BG, COLOR_PANEL_BORDER);
        double tabW = (w - 16) / 3.0;
        categoryTabButtons[0] = createBtn(this, "1. PAYLOAD", x + 4, 242, tabW - 4, 30, () -> selectCategoryTab(0));
        categoryTabButtons[1] = createBtn(this, "2. TANKS", x + 4 + tabW, 242, tabW - 4, 30, () -> selectCategoryTab(1));
        categoryTabButtons[2] = createBtn(this, "3. ENGINES", x + 4 + tabW * 2, 242, tabW - 4, 30, () -> selectCategoryTab(2));

        // Box 4: 2-Column Tactical Parts Grid Container (y: 282..616, h: 334)
        createBox(this, x, 282, w, 334, COLOR_PANEL_BG, COLOR_PANEL_BORDER);
        gridCardsContainer = new Control();
        gridCardsContainer.setPosition(new Vector2(x + 6, 288));
        gridCardsContainer.setSize(new Vector2(w - 12, 322));
        addChild(gridCardsContainer);

        // Box 5: High-Contrast LAUNCH / FLIGHT ACTION Button (y: 622..672, h: 50)
        launchOrFlightActionButton = createBtn(this, "LAUNCH ROCKET", x, 622, w, 50, this::onLaunchOrActionPressed);
        secondaryFlightActionButton = createBtn(this, "OVERRIDE ANOMALY", x, 584, w, 34, this::onSecondaryActionPressed);
        secondaryFlightActionButton.setVisible(false);
    }

    private void buildRightRocketViewport() {
        double x = 436;
        double y = 48;
        double w = 828;
        double h = 624;

        // Viewport background (dark sky canvas that darkens as rocket ascends)
        viewportSkyRect = createBox(this, x, y, w, h, new Color(0.06, 0.08, 0.13, 1.0), COLOR_PANEL_BORDER);

        // Reference 1 Blueprint Dimension Frame
        createTechnicalDimensionFrame(x, y, w, h);

        // Rocket Root Anchor inside viewport (x center = 850, base pad y = 560)
        rocketRootContainer = new Control();
        rocketRootContainer.setPosition(new Vector2(822, 560));
        rocketRootContainer.setSize(new Vector2(120, 480));
        addChild(rocketRootContainer);

        // Rocket Sections (anchored inside rocketRootContainer)
        engineVisualContainer = new Control();
        boosterVisualContainer = new Control();
        upperStageVisualContainer = new Control();
        payloadVisualContainer = new Control();
        exhaustPlumeContainer = new Control();

        rocketRootContainer.addChild(exhaustPlumeContainer);
        rocketRootContainer.addChild(engineVisualContainer);
        rocketRootContainer.addChild(boosterVisualContainer);
        rocketRootContainer.addChild(upperStageVisualContainer);
        rocketRootContainer.addChild(payloadVisualContainer);

        // Telemetry overlay in upper-right of viewport
        viewportTelemetryOverlay = createWrappedLabel(this, "", x + 24, y + 24, 300, 120, 12, COLOR_WHITE_TEXT);
    }

    private void createTechnicalDimensionFrame(double x, double y, double w, double h) {
        // Reference 1 Technical Dimension Measurement Frame
        // Top dimension bar
        createBox(this, x + 40, y + 20, w - 80, 2, COLOR_PANEL_BORDER, null);
        createBox(this, x + 40, y + 14, 2, 14, COLOR_PANEL_BORDER, null);
        createBox(this, x + w - 42, y + 14, 2, 14, COLOR_PANEL_BORDER, null);
        dimensionTopLabel = createLabel(this, "[ Ø 3.8m CORE DIAMETER ]", x + 60, y + 8, w - 120, 16, 10, COLOR_MUTED_TEXT);
        dimensionTopLabel.setHorizontalAlignment(HorizontalAlignment.CENTER);

        // Right height dimension bar
        createBox(this, x + w - 24, y + 40, 2, h - 80, COLOR_PANEL_BORDER, null);
        createBox(this, x + w - 30, y + 40, 14, 2, COLOR_PANEL_BORDER, null);
        createBox(this, x + w - 30, y + h - 42, 14, 2, COLOR_PANEL_BORDER, null);
        dimensionHeightLabel = createLabel(this, "HEIGHT\n46.5 m", x + w - 80, y + (h / 2.0) - 20, 52, 34, 10, COLOR_MUTED_TEXT);
        dimensionHeightLabel.setHorizontalAlignment(HorizontalAlignment.RIGHT);

        // Ground Launch Pad Line
        createBox(this, x + 30, y + 560, w - 60, 4, new Color(0.25, 0.30, 0.40, 1.0), null);
        createBox(this, x + 40, y + 564, w - 80, 18, new Color(0.12, 0.14, 0.19, 1.0), null);
        dimensionPadLabel = createLabel(this, "// LAUNCH PAD LC-39A // STANDBY", x + 50, y + 566, 320, 16, 10, COLOR_MUTED_TEXT);

        // Launch Gantry Mast & Retractable Umbilical
        createBox(this, 750, y + 210, 10, 350, new Color(0.20, 0.25, 0.35, 1.0), null);
        createBox(this, 760, y + 280, 46, 6, new Color(0.28, 0.34, 0.46, 1.0), null);
    }

    // =========================================================================
    // 2-COLUMN TACTICAL LOADOUT GRID (BOX 4)
    // =========================================================================

    private void selectCategoryTab(int tabIndex) {
        selectedCategoryTab = tabIndex;
        refreshCategoryTabsUI();
        rebuildTacticalCardsGrid();
    }

    private void refreshCategoryTabsUI() {
        for (int i = 0; i < 3; i++) {
            boolean active = (i == selectedCategoryTab);
            Button b = categoryTabButtons[i];
            b.setFlat(!active);
        }
    }

    private void rebuildTacticalCardsGrid() {
        // Clear previous cards
        for (Control c : dynamicCardNodes) {
            c.queueFree();
        }
        dynamicCardNodes.clear();

        double cardW = 192;
        double cardH = 74;
        double gapX = 8;
        double gapY = 8;

        if (selectedCategoryTab == 0) {
            // PAYLOAD CATEGORY
            List<RocketPart> payloads = PartCatalog.getPayloads();
            for (int i = 0; i < payloads.size(); i++) {
                final int idx = i;
                RocketPart part = payloads.get(i);
                boolean isEquipped = (payloadIndex == i);
                boolean isSurplus = isEquipped ? payloadSurplus : false;

                double col = i % 2;
                double row = i / 2;
                double cardX = col * (cardW + gapX);
                double cardY = row * (cardH + gapY);

                Control card = createTacticalCard(
                        cardX, cardY, cardW, cardH,
                        part,
                        isEquipped,
                        isSurplus,
                        String.format(Locale.US, "Seats: %d | Cargo: %.0fkg", part.getCrewCapacity(), part.getCargoCapacityKg()),
                        () -> {
                            payloadIndex = idx;
                            onSelectionChanged(part);
                        }
                );
                gridCardsContainer.addChild(card);
                dynamicCardNodes.add(card);
            }
        } else if (selectedCategoryTab == 1) {
            // TANKS CATEGORY (Booster Tanks + Optional Upper Stage)
            List<RocketPart> boosters = PartCatalog.getBoosterTanks();
            // Row 0-1: 3 Booster Tanks
            for (int i = 0; i < boosters.size(); i++) {
                final int idx = i;
                RocketPart part = boosters.get(i);
                boolean isEquipped = (boosterIndex == i);
                boolean isSurplus = isEquipped ? boosterSurplus : false;

                double col = i % 2;
                double row = i / 2;
                double cardX = col * (cardW + gapX);
                double cardY = row * (cardH + gapY);

                Control card = createTacticalCard(
                        cardX, cardY, cardW, cardH,
                        part,
                        isEquipped,
                        isSurplus,
                        String.format(Locale.US, "Propellant: %,.0f kg", part.getFuelMassKg()),
                        () -> {
                            boosterIndex = idx;
                            onSelectionChanged(part);
                        }
                );
                gridCardsContainer.addChild(card);
                dynamicCardNodes.add(card);
            }

            // Row 2-3: Upper Stage Options (Tile for [NO UPPER STAGE], then Centaur-Mini & Cryo-Star)
            // NO UPPER STAGE TILE
            boolean noUpperEquipped = (upperStageIndex == 0);
            double noUpperX = 1 * (cardW + gapX);
            double noUpperY = 1 * (cardH + gapY);
            Control noUpperCard = createSpecialActionCard(
                    noUpperX, noUpperY, cardW, cardH,
                    "[ NO UPPER STAGE ]",
                    "$0 (Single-Stage)",
                    noUpperEquipped,
                    COLOR_LIME_ACCENT,
                    "Direct Payload-to-Booster (0px gap)",
                    () -> {
                        upperStageIndex = 0;
                        onSelectionChanged(null);
                    }
            );
            gridCardsContainer.addChild(noUpperCard);
            dynamicCardNodes.add(noUpperCard);

            List<RocketPart> uppers = PartCatalog.getUpperStages();
            for (int i = 0; i < uppers.size(); i++) {
                final int uIdx = i + 1;
                RocketPart part = uppers.get(i);
                boolean isEquipped = (upperStageIndex == uIdx);
                boolean isSurplus = isEquipped ? upperStageSurplus : false;

                double col = i % 2;
                double row = 2 + (i / 2);
                double cardX = col * (cardW + gapX);
                double cardY = row * (cardH + gapY);

                Control card = createTacticalCard(
                        cardX, cardY, cardW, cardH,
                        part,
                        isEquipped,
                        isSurplus,
                        String.format(Locale.US, "Upper Stage Isp: %.0fs", part.getIspSeconds()),
                        () -> {
                            upperStageIndex = uIdx;
                            onSelectionChanged(part);
                        }
                );
                gridCardsContainer.addChild(card);
                dynamicCardNodes.add(card);
            }
        } else {
            // ENGINES CATEGORY
            List<RocketPart> engines = PartCatalog.getEngines();
            for (int i = 0; i < engines.size(); i++) {
                final int idx = i;
                RocketPart part = engines.get(i);
                boolean isEquipped = (engineIndex == i);
                boolean isSurplus = isEquipped ? engineSurplus : false;

                double col = i % 2;
                double row = i / 2;
                double cardX = col * (cardW + gapX);
                double cardY = row * (cardH + gapY);

                String nozzleCallout = switch (i) {
                    case 0 -> "Single Nozzle (480 kN)";
                    case 1 -> "Twin Nozzle (1,100 kN)";
                    default -> "Triple Clustered (2,100 kN)";
                };

                Control card = createTacticalCard(
                        cardX, cardY, cardW, cardH,
                        part,
                        isEquipped,
                        isSurplus,
                        nozzleCallout,
                        () -> {
                            engineIndex = idx;
                            onSelectionChanged(part);
                        }
                );
                gridCardsContainer.addChild(card);
                dynamicCardNodes.add(card);
            }
        }
    }

    private Control createTacticalCard(
            double x, double y, double w, double h,
            RocketPart part,
            boolean isEquipped,
            boolean isSurplus,
            String subStatText,
            Runnable onClick) {
        Control root = new Control();
        root.setPosition(new Vector2(x, y));
        root.setSize(new Vector2(w, h));

        // Background box
        Color borderCol = isEquipped ? (isSurplus ? COLOR_AMBER_ACCENT : COLOR_LIME_ACCENT) : COLOR_PANEL_BORDER;
        createBox(root, 0, 0, w, h, COLOR_PANEL_BG, borderCol);

        // Reference 3 Tactical Header Strip (Price & Status Pill)
        Color headerBg = isEquipped ? (isSurplus ? COLOR_AMBER_ACCENT : COLOR_LIME_ACCENT) : COLOR_CARD_DEFAULT_HEADER;
        Color headerTextColor = isEquipped ? COLOR_DARK_TEXT : COLOR_WHITE_TEXT;
        createBox(root, 0, 0, w, 20, headerBg, null);

        long displayCost = isSurplus ? part.asSurplus().getCostDollars() : part.getCostDollars();
        String priceText = String.format(Locale.US, "$%.1fM %s", displayCost / 1_000_000.0, isSurplus ? "[SURPLUS]" : "");
        Label priceLbl = createLabel(root, priceText, 6, 2, w - 12, 16, 10, headerTextColor);
        priceLbl.setClipText(true);

        // Body: Part Name & Stats
        Label nameLbl = createLabel(root, part.getName(), 6, 24, w - 12, 18, 11, COLOR_WHITE_TEXT);
        nameLbl.setClipText(true);

        Label statLbl = createLabel(root, subStatText, 6, 42, w - 12, 16, 10, COLOR_MUTED_TEXT);
        statLbl.setClipText(true);

        String prepText = String.format(Locale.US, "Prep: %dd | Rel: %.0f%%", isSurplus ? part.asSurplus().getPrepDays() : part.getPrepDays(), part.getReliability() * 100.0);
        Label prepLbl = createLabel(root, prepText, 6, 56, w - 12, 16, 9, isEquipped ? (isSurplus ? COLOR_AMBER_ACCENT : COLOR_LIME_ACCENT) : COLOR_MUTED_TEXT);
        prepLbl.setClipText(true);

        // Invisible click overlay button
        Button clickOverlay = createBtn(root, "", 0, 0, w, h, onClick);
        clickOverlay.setFlat(true);

        return root;
    }

    private Control createSpecialActionCard(
            double x, double y, double w, double h,
            String title,
            String priceText,
            boolean isEquipped,
            Color accentColor,
            String subStatText,
            Runnable onClick) {
        Control root = new Control();
        root.setPosition(new Vector2(x, y));
        root.setSize(new Vector2(w, h));

        Color borderCol = isEquipped ? accentColor : COLOR_PANEL_BORDER;
        createBox(root, 0, 0, w, h, COLOR_PANEL_BG, borderCol);

        Color headerBg = isEquipped ? accentColor : COLOR_CARD_DEFAULT_HEADER;
        Color headerTextColor = isEquipped ? COLOR_DARK_TEXT : COLOR_WHITE_TEXT;
        createBox(root, 0, 0, w, 20, headerBg, null);

        Label priceLbl = createLabel(root, priceText, 6, 2, w - 12, 16, 10, headerTextColor);
        priceLbl.setClipText(true);

        Label nameLbl = createLabel(root, title, 6, 24, w - 12, 18, 11, COLOR_WHITE_TEXT);
        nameLbl.setClipText(true);

        Label statLbl = createLabel(root, subStatText, 6, 44, w - 12, 24, 10, COLOR_MUTED_TEXT);
        statLbl.setAutowrapMode(TextServer.AutowrapMode.WORD_SMART);

        Button clickOverlay = createBtn(root, "", 0, 0, w, h, onClick);
        clickOverlay.setFlat(true);

        return root;
    }

    private void onSelectionChanged(RocketPart clickedPart) {
        if (activeFlight != null) {
            activeFlight = null;
        }
        syncBlueprintFromSelections();
        if (clickedPart != null) {
            inspectedPart = clickedPart;
        } else {
            inspectedPart = blueprint.getBoosterTank();
        }
        refreshAllUi();
    }

    private void toggleInspectedCondition() {
        if (inspectedPart == null) {
            return;
        }
        if (activeFlight != null) {
            activeFlight = null;
        }

        PartCategory cat = inspectedPart.getCategory();
        switch (cat) {
            case PAYLOAD -> payloadSurplus = !payloadSurplus;
            case UPPER_STAGE -> upperStageSurplus = !upperStageSurplus;
            case BOOSTER_TANK -> boosterSurplus = !boosterSurplus;
            case ENGINE -> engineSurplus = !engineSurplus;
        }
        syncBlueprintFromSelections();
        refreshAllUi();
    }

    private void autoFitCurrentMission() {
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
        inspectedPart = blueprint.getPayload();
        refreshAllUi();
    }

    // =========================================================================
    // SEAMLESS 3-SECTION VECTOR ROCKET RENDERING (NO GAPS!)
    // =========================================================================

    private void rebuildSeamlessRocketVisual() {
        // Clear previous visual children
        clearContainerChildren(payloadVisualContainer);
        clearContainerChildren(upperStageVisualContainer);
        clearContainerChildren(boosterVisualContainer);
        clearContainerChildren(engineVisualContainer);
        clearContainerChildren(exhaustPlumeContainer);

        RocketPart p = blueprint.getPayload();
        RocketPart u = blueprint.getUpperStage();
        RocketPart b = blueprint.getBoosterTank();
        RocketPart e = blueprint.getMainEngine();

        // Rocket Stack Dimensions
        double coreWidth = 56.0;
        double engineSkirtHeight = 44.0;

        // Heights
        double boosterHeight = 130.0;
        if (b != null) {
            if (b.getId().startsWith("tank_heavy")) {
                boosterHeight = 190.0;
            } else if (b.getId().startsWith("tank_medium")) {
                boosterHeight = 160.0;
            }
        }

        double upperHeight = (u != null) ? 68.0 : 0.0;
        double payloadHeight = 92.0;

        // Mathematical Vertical Anchoring from Pad Upward:
        // Base anchor (engine bottom nozzle) is at local y = 0
        // Section 3: Engine sits at y = -engineSkirtHeight
        // Section 2: Booster sits directly on engine skirt at y = -(engineSkirtHeight + boosterHeight)
        // If Upper Stage exists: Upper stage sits at y = -(engineSkirtHeight + boosterHeight + upperHeight)
        // Section 1: Payload sits directly on top of upper stage (or on booster tank if upper stage is NONE)
        double engineBaseY = 0.0;
        double boosterBaseY = -engineSkirtHeight;
        double upperStageBaseY = boosterBaseY - boosterHeight;
        double payloadBaseY = (u != null) ? (upperStageBaseY - upperHeight) : (boosterBaseY - boosterHeight);

        // 1. SECTION 3: ENGINES (Flared Skirt + Swept Fins + Nozzles)
        engineVisualContainer.setPosition(new Vector2(0, boosterBaseY));
        drawEngineSection(coreWidth, engineSkirtHeight, e);

        // 2. SECTION 2: FUEL / BOOSTER TANK
        boosterVisualContainer.setPosition(new Vector2(0, upperStageBaseY));
        drawBoosterTankSection(coreWidth, boosterHeight, b);

        // 2B. OPTIONAL UPPER STAGE
        if (u != null) {
            upperStageVisualContainer.setVisible(true);
            upperStageVisualContainer.setPosition(new Vector2(0, payloadBaseY));
            drawUpperStageSection(coreWidth, upperHeight, u);
        } else {
            upperStageVisualContainer.setVisible(false);
        }

        // 3. SECTION 1: PAYLOAD (Tapered Nosecone, Porthole/Cargo Ribs)
        payloadVisualContainer.setPosition(new Vector2(0, payloadBaseY - payloadHeight));
        drawPayloadSection(coreWidth, payloadHeight, p);

        // Exhaust Plumes (Under Engine Nozzles)
        exhaustPlumeContainer.setPosition(new Vector2(0, engineBaseY));
        drawExhaustPlumes(coreWidth, e);

        // Update technical dimension labels
        double totalPixelHeight = engineSkirtHeight + boosterHeight + upperHeight + payloadHeight;
        double estimatedMeters = totalPixelHeight * 0.14;
        dimensionHeightLabel.setText(String.format(Locale.US, "TOTAL HT\n%.1fm", estimatedMeters));
    }

    private void drawPayloadSection(double width, double height, RocketPart payload) {
        Color bodyColor = (payload != null && payload.getCondition() == PartCondition.SURPLUS_REFURBISHED)
                ? new Color(0.82, 0.60, 0.32, 1.0)
                : new Color(0.92, 0.94, 0.98, 1.0);

        double centerX = width / 2.0;

        // Tapered aerodynamic nose cone polygon: (centerX, 0) -> (width, height * 0.6) -> (width, height) -> (0, height) -> (0, height * 0.6)
        Vector2[] noseVerts = new Vector2[]{
                new Vector2(centerX, 0),
                new Vector2(width, height * 0.58),
                new Vector2(width, height),
                new Vector2(0, height),
                new Vector2(0, height * 0.58)
        };
        createPolygon(payloadVisualContainer, noseVerts, bodyColor);
        createLine(payloadVisualContainer, noseVerts, true, 2.0f, COLOR_WHITE_TEXT);

        // Technical details based on payload type
        if (payload != null && payload.getPayloadType() == PayloadType.CREW_RESCUE_CAPSULE) {
            // Porthole Window (Crew Capsule)
            createBox(payloadVisualContainer, centerX - 8, height * 0.50, 16, 16, COLOR_BG_DEEP, COLOR_CYAN_ACCENT);
            createBox(payloadVisualContainer, centerX - 5, height * 0.50 + 3, 10, 10, COLOR_CYAN_ACCENT, null);
            // Reentry Hatch Line
            createBox(payloadVisualContainer, centerX - 12, height * 0.74, 24, 2, COLOR_MUTED_TEXT, null);
        } else if (payload != null && payload.getPayloadType() == PayloadType.SUPPLY_CARGO_POD) {
            // Horizontal Cargo Ribs
            createBox(payloadVisualContainer, 4, height * 0.45, width - 8, 2, COLOR_MUTED_TEXT, null);
            createBox(payloadVisualContainer, 4, height * 0.65, width - 8, 2, COLOR_MUTED_TEXT, null);
            createBox(payloadVisualContainer, 4, height * 0.85, width - 8, 2, COLOR_MUTED_TEXT, null);
        } else {
            // Science Sensor louvers & Antenna Mast
            createBox(payloadVisualContainer, centerX - 1, -16, 2, 16, COLOR_CYAN_ACCENT, null);
            createBox(payloadVisualContainer, centerX - 5, -18, 10, 3, COLOR_CYAN_ACCENT, null);
            createBox(payloadVisualContainer, 6, height * 0.70, width - 12, 10, new Color(0.12, 0.22, 0.35, 1.0), COLOR_CYAN_ACCENT);
        }
    }

    private void drawUpperStageSection(double width, double height, RocketPart upperStage) {
        Color bodyColor = (upperStage != null && upperStage.getCondition() == PartCondition.SURPLUS_REFURBISHED)
                ? new Color(0.72, 0.58, 0.38, 1.0)
                : new Color(0.85, 0.88, 0.94, 1.0);

        // Upper Stage Main Body
        createBox(upperStageVisualContainer, 0, 0, width, height, bodyColor, COLOR_WHITE_TEXT);

        // Interstage Separation Band at the bottom (dark structural lattice)
        createBox(upperStageVisualContainer, 0, height - 8, width, 8, new Color(0.18, 0.20, 0.26, 1.0), COLOR_MUTED_TEXT);

        // Cryogenic insulation vertical seams
        double centerX = width / 2.0;
        createBox(upperStageVisualContainer, centerX - 12, 4, 1, height - 16, COLOR_MUTED_TEXT, null);
        createBox(upperStageVisualContainer, centerX + 12, 4, 1, height - 16, COLOR_MUTED_TEXT, null);
    }

    private void drawBoosterTankSection(double width, double height, RocketPart booster) {
        Color bodyColor = (booster != null && booster.getCondition() == PartCondition.SURPLUS_REFURBISHED)
                ? new Color(0.68, 0.52, 0.32, 1.0)
                : new Color(0.90, 0.92, 0.96, 1.0);

        // Main cylindrical fuselage
        createBox(boosterVisualContainer, 0, 0, width, height, bodyColor, COLOR_WHITE_TEXT);

        // External pressurization line along left flank
        createBox(boosterVisualContainer, -4, 6, 3, height - 12, new Color(0.35, 0.40, 0.50, 1.0), null);

        // Vertical stringer ribs (structural panel lines)
        double centerX = width / 2.0;
        createBox(boosterVisualContainer, centerX - 16, 8, 1, height - 16, COLOR_MUTED_TEXT, null);
        createBox(boosterVisualContainer, centerX, 8, 1, height - 16, COLOR_MUTED_TEXT, null);
        createBox(boosterVisualContainer, centerX + 16, 8, 1, height - 16, COLOR_MUTED_TEXT, null);

        // Horizontal weld seams
        createBox(boosterVisualContainer, 0, height * 0.33, width, 1, COLOR_MUTED_TEXT, null);
        createBox(boosterVisualContainer, 0, height * 0.66, width, 1, COLOR_MUTED_TEXT, null);
    }

    private void drawEngineSection(double width, double height, RocketPart engine) {
        Color skirtColor = (engine != null && engine.getCondition() == PartCondition.SURPLUS_REFURBISHED)
                ? new Color(0.50, 0.38, 0.24, 1.0)
                : new Color(0.32, 0.36, 0.45, 1.0);

        // Flared engine skirt polygon: (0, 0) -> (width, 0) -> (width + 12, height) -> (-12, height)
        Vector2[] skirtVerts = new Vector2[]{
                new Vector2(0, 0),
                new Vector2(width, 0),
                new Vector2(width + 12, height),
                new Vector2(-12, height)
        };
        createPolygon(engineVisualContainer, skirtVerts, skirtColor);
        createLine(engineVisualContainer, skirtVerts, true, 2.0f, COLOR_WHITE_TEXT);

        // Reference 1 & 2 Swept Aerodynamic Fins
        // Left Fin: (-12, 10) -> (-34, height + 8) -> (-12, height)
        Vector2[] leftFinVerts = new Vector2[]{
                new Vector2(-12, 10),
                new Vector2(-36, height + 10),
                new Vector2(-12, height)
        };
        createPolygon(engineVisualContainer, leftFinVerts, new Color(0.25, 0.28, 0.36, 1.0));
        createLine(engineVisualContainer, leftFinVerts, true, 2.0f, COLOR_WHITE_TEXT);

        // Right Fin: (width + 12, 10) -> (width + 34, height + 8) -> (width + 12, height)
        Vector2[] rightFinVerts = new Vector2[]{
                new Vector2(width + 12, 10),
                new Vector2(width + 36, height + 10),
                new Vector2(width + 12, height)
        };
        createPolygon(engineVisualContainer, rightFinVerts, new Color(0.25, 0.28, 0.36, 1.0));
        createLine(engineVisualContainer, rightFinVerts, true, 2.0f, COLOR_WHITE_TEXT);

        // Engine Thruster Nozzles (Bells) at bottom
        int nozzleCount = 1;
        if (engine != null) {
            if (engine.getId().startsWith("engine_heavy")) {
                nozzleCount = 3;
            } else if (engine.getId().startsWith("engine_methalox")) {
                nozzleCount = 2;
            }
        }

        double nozzleY = height;
        double nozzleHeight = 16.0;
        double skirtBottomWidth = width + 24.0;
        double skirtLeft = -12.0;

        if (nozzleCount == 1) {
            // Single Large Bell
            double bellW = 28.0;
            double bellX = (width / 2.0) - (bellW / 2.0);
            drawNozzleBell(engineVisualContainer, bellX, nozzleY, bellW, nozzleHeight);
        } else if (nozzleCount == 2) {
            // Twin Bells
            double bellW = 20.0;
            double centerX = width / 2.0;
            drawNozzleBell(engineVisualContainer, centerX - bellW - 3, nozzleY, bellW, nozzleHeight);
            drawNozzleBell(engineVisualContainer, centerX + 3, nozzleY, bellW, nozzleHeight);
        } else {
            // Triple Clustered Bells
            double bellW = 16.0;
            double centerX = width / 2.0;
            drawNozzleBell(engineVisualContainer, centerX - bellW * 1.5 - 4, nozzleY, bellW, nozzleHeight);
            drawNozzleBell(engineVisualContainer, centerX - (bellW / 2.0), nozzleY, bellW, nozzleHeight);
            drawNozzleBell(engineVisualContainer, centerX + (bellW * 0.5) + 4, nozzleY, bellW, nozzleHeight);
        }
    }

    private void drawNozzleBell(Control parent, double x, double y, double w, double h) {
        Vector2[] bellVerts = new Vector2[]{
                new Vector2(x + (w * 0.20), y),
                new Vector2(x + (w * 0.80), y),
                new Vector2(x + w, y + h),
                new Vector2(x, y + h)
        };
        createPolygon(parent, bellVerts, new Color(0.18, 0.20, 0.25, 1.0));
        createLine(parent, bellVerts, true, 1.5f, COLOR_MUTED_TEXT);
    }

    private void drawExhaustPlumes(double width, RocketPart engine) {
        int nozzleCount = (engine != null && engine.getId().startsWith("engine_heavy")) ? 3
                : (engine != null && engine.getId().startsWith("engine_methalox") ? 2 : 1);

        double plumeY = 16.0;
        double centerX = width / 2.0;

        if (nozzleCount == 1) {
            createBox(exhaustPlumeContainer, centerX - 12, plumeY, 24, 46, COLOR_AMBER_ACCENT, null);
            createBox(exhaustPlumeContainer, centerX - 6, plumeY + 4, 12, 38, COLOR_LIME_ACCENT, null);
        } else if (nozzleCount == 2) {
            createBox(exhaustPlumeContainer, centerX - 21, plumeY, 16, 42, COLOR_AMBER_ACCENT, null);
            createBox(exhaustPlumeContainer, centerX + 5, plumeY, 16, 42, COLOR_AMBER_ACCENT, null);
        } else {
            createBox(exhaustPlumeContainer, centerX - 26, plumeY, 14, 42, COLOR_AMBER_ACCENT, null);
            createBox(exhaustPlumeContainer, centerX - 7, plumeY, 14, 46, COLOR_AMBER_ACCENT, null);
            createBox(exhaustPlumeContainer, centerX + 12, plumeY, 14, 42, COLOR_AMBER_ACCENT, null);
        }
        exhaustPlumeContainer.setVisible(false);
    }

    // =========================================================================
    // FLIGHT ANIMATION & TELEMETRY
    // =========================================================================

    private void updateRocketFlightAnimation(double delta) {
        if (activeFlight == null) {
            rocketRootContainer.setPosition(new Vector2(822, 560));
            exhaustPlumeContainer.setVisible(false);
            viewportSkyRect.setColor(new Color(0.06, 0.08, 0.13, 1.0));
            boosterVisualContainer.setVisible(true);
            engineVisualContainer.setVisible(true);
            return;
        }

        double progress = activeFlight.getOverallProgressRatio();
        FlightSimulation.Phase phase = activeFlight.getPhase();

        // Sky transition from atmosphere to orbital black
        double r = 0.06 * (1.0 - progress) + 0.01 * progress;
        double g = 0.08 * (1.0 - progress) + 0.01 * progress;
        double b = 0.13 * (1.0 - progress) + 0.03 * progress;
        viewportSkyRect.setColor(new Color(r, g, b, 1.0));

        // Smooth ascent translation up the launch shaft
        double currentY = 560.0 - (progress * 260.0);
        rocketRootContainer.setPosition(new Vector2(822, currentY));

        // Stage 1 separation (booster & main engine jettisoned)
        boolean stage1Burning = (phase == FlightSimulation.Phase.STAGE_1_ASCENT);
        boolean stage1Attached = (phase == FlightSimulation.Phase.PRE_LAUNCH
                || phase == FlightSimulation.Phase.STAGE_1_ASCENT
                || phase == FlightSimulation.Phase.AWAITING_STAGE_SEP);

        boosterVisualContainer.setVisible(stage1Attached);
        engineVisualContainer.setVisible(stage1Attached);

        boolean burning = (phase == FlightSimulation.Phase.STAGE_1_ASCENT || phase == FlightSimulation.Phase.UPPER_STAGE_BURN);
        exhaustPlumeContainer.setVisible(burning);

        viewportTelemetryOverlay.setText(String.format(
                Locale.US,
                "// FLIGHT TELEMETRY //\n"
                        + "Phase: %s\n"
                        + "Mission Time: T+%.1fs\n"
                        + "Altitude: %,.0f km / %,.0f km\n"
                        + "Velocity: %,.0f m/s / %,.0f m/s\n"
                        + "%s",
                phase.getDisplayName(),
                activeFlight.getElapsedSeconds(),
                activeFlight.getCurrentAltitudeKm(),
                getActiveContract().getTargetAltitudeKm(),
                activeFlight.getCurrentVelocityMps(),
                getActiveContract().getRequiredDeltaVMps(),
                activeFlight.isAnomalyActive() ? ("\n>>> " + activeFlight.getActiveAnomalyMessage()) : ""
        ));
    }

    // =========================================================================
    // UI REFRESH DISPATCHER
    // =========================================================================

    private void refreshAllUi() {
        MissionContract contract = getActiveContract();

        // Top Bar
        topAgencyStatsLabel.setText(String.format(
                Locale.US,
                "CAMPAIGN: %d/%d COMPLETED  |  ASTRONAUTS RESCUED: %d  |  CARGO: %,.0f kg  |  FUNDS: $%,d",
                agencyState.getMissionsCompleted(),
                MissionCatalog.getAllMissions().size(),
                agencyState.getTotalAstronautsRescued(),
                agencyState.getTotalCargoDeliveredKg(),
                agencyState.getReserveFundsDollars()
        ));

        // Left Sidebar Region 1 (Mission Directive)
        missionCodeLabel.setText(String.format(Locale.US, "[%d/%d] %s", selectedMissionIndex + 1, MissionCatalog.getAllMissions().size(), contract.getCodeName()));
        missionSummaryLabel.setText(String.format(Locale.US, "%s | Cap: $%,d | Limit: %dd", contract.getMissionType().getDisplayName(), contract.getBudgetLimitDollars(), contract.getDeadlineDays()));

        // Left Sidebar Region 2 (Inspector)
        if (inspectedPart == null) {
            inspectedPart = blueprint.getPayload();
        }
        PartCondition cond = inspectedPart.getCondition();
        inspectorTitleLabel.setText(String.format(Locale.US, "%s (%s)", inspectedPart.getName(), cond.getLabel()));
        inspectorStatsLabel.setText(String.format(
                Locale.US,
                "Cost: $%,d  |  Prep: %dd  |  Mass: %,.0f kg\n%s",
                inspectedPart.getCostDollars(),
                inspectedPart.getPrepDays(),
                inspectedPart.getWetMassKg(),
                inspectedPart.getDescription()
        ));
        inspectorConditionToggleBtn.setText(cond == PartCondition.SURPLUS_REFURBISHED ? "CONDITION: SURPLUS (45% OFF)" : "CONDITION: FACTORY NEW");

        // Left Sidebar Region 3 & 4
        refreshCategoryTabsUI();
        rebuildTacticalCardsGrid();

        // Rocket Viewport
        rebuildSeamlessRocketVisual();

        // Bottom Telemetry Bar & Launch Buttons
        refreshBottomTelemetryBar();
        refreshLaunchButtonsAndLog();
    }

    private void refreshBottomTelemetryBar() {
        MissionContract contract = getActiveContract();
        ValidationResult val = RocketValidator.validate(blueprint, contract);

        long cost = blueprint.getTotalCostDollars();
        long maxCost = contract.getBudgetLimitDollars();
        int prep = blueprint.getTotalPrepDays();
        int maxPrep = contract.getDeadlineDays();
        double rel = blueprint.getCombinedReliability() * 100.0;

        bottomStatsLeftLabel.setText(String.format(
                Locale.US,
                "BUDGET: $%,d / $%,d (%s)  |  PREP: %d / %dd (%s)  |  RELIABILITY: %.0f%%",
                cost, maxCost, val.isWithinBudget() ? "OK" : "OVER",
                prep, maxPrep, val.isWithinDeadline() ? "OK" : "LATE",
                rel
        ));

        double twr = blueprint.getLaunchTwr();
        double dv = blueprint.getTotalDeltaVMps();
        double reqDv = contract.getRequiredDeltaVMps();
        double mass = blueprint.getTotalWetMassKg();

        bottomStatsRightLabel.setText(String.format(
                Locale.US,
                "TWR: %.2f (%s)  |  DELTA-V: %,.0f / %,.0f m/s (%s)  |  MASS: %,.0f kg",
                twr, val.isSufficientTwr() ? "OK" : "LOW",
                dv, reqDv, val.isSufficientDeltaV() ? "OK" : "DEFICIT",
                mass
        ));
    }

    private void refreshLaunchButtonsAndLog() {
        MissionContract contract = getActiveContract();
        ValidationResult val = RocketValidator.validate(blueprint, contract);

        if (activeFlight == null) {
            secondaryFlightActionButton.setVisible(false);
            if (val.isValidForMission()) {
                launchOrFlightActionButton.setText("LAUNCH ROCKET");
                launchOrFlightActionButton.setDisabled(false);
            } else {
                launchOrFlightActionButton.setText("CANNOT LAUNCH (CHECK CONSTRAINTS)");
                launchOrFlightActionButton.setDisabled(true);
            }
        } else {
            FlightSimulation.Phase phase = activeFlight.getPhase();
            switch (phase) {
                case AWAITING_STAGE_SEP -> {
                    launchOrFlightActionButton.setText("STAGE SEPARATION >>");
                    launchOrFlightActionButton.setDisabled(false);
                }
                case ORBIT_ACHIEVED -> {
                    launchOrFlightActionButton.setText("MISSION SUCCESS! ADVANCE >>");
                    launchOrFlightActionButton.setDisabled(false);
                }
                case MISSION_ABORTED -> {
                    launchOrFlightActionButton.setText("MISSION FAILED — RESET PAD");
                    launchOrFlightActionButton.setDisabled(false);
                }
                default -> {
                    launchOrFlightActionButton.setText("ASCENT IN PROGRESS...");
                    launchOrFlightActionButton.setDisabled(true);
                }
            }

            if (activeFlight.isAnomalyActive()) {
                secondaryFlightActionButton.setVisible(true);
                secondaryFlightActionButton.setText("! OVERRIDE ANOMALY !");
            } else {
                secondaryFlightActionButton.setVisible(false);
            }
        }
    }

    private void onLaunchOrActionPressed() {
        if (activeFlight == null) {
            MissionContract contract = getActiveContract();
            ValidationResult val = RocketValidator.validate(blueprint, contract);
            if (!val.isValidForMission()) {
                return;
            }
            missionRewardClaimed = false;
            activeFlight = new FlightSimulation(blueprint, contract);
            activeFlight.startLaunch();
            refreshAllUi();
        } else {
            FlightSimulation.Phase phase = activeFlight.getPhase();
            if (phase == FlightSimulation.Phase.AWAITING_STAGE_SEP) {
                activeFlight.triggerStageSeparation();
                refreshAllUi();
            } else if (phase == FlightSimulation.Phase.ORBIT_ACHIEVED) {
                selectedMissionIndex = agencyState.getCurrentMissionIndex();
                activeFlight = null;
                syncBlueprintFromSelections();
                refreshAllUi();
            } else if (phase == FlightSimulation.Phase.MISSION_ABORTED) {
                activeFlight = null;
                refreshAllUi();
            }
        }
    }

    private void onSecondaryActionPressed() {
        if (activeFlight != null && activeFlight.isAnomalyActive()) {
            activeFlight.resolveAnomaly();
            refreshAllUi();
        }
    }

    // =========================================================================
    // UI & GRAPHIC FACTORY HELPERS
    // =========================================================================

    private static ColorRect createBox(Control parent, double x, double y, double w, double h, Color fill, Color border) {
        ColorRect box = new ColorRect();
        box.setPosition(new Vector2(x, y));
        box.setSize(new Vector2(w, h));
        box.setColor(fill);
        parent.addChild(box);

        if (border != null) {
            // Draw 1px tactical border frame
            ColorRect top = new ColorRect();
            top.setPosition(new Vector2(0, 0));
            top.setSize(new Vector2(w, 1));
            top.setColor(border);
            box.addChild(top);

            ColorRect bottom = new ColorRect();
            bottom.setPosition(new Vector2(0, h - 1));
            bottom.setSize(new Vector2(w, 1));
            bottom.setColor(border);
            box.addChild(bottom);

            ColorRect left = new ColorRect();
            left.setPosition(new Vector2(0, 0));
            left.setSize(new Vector2(1, h));
            left.setColor(border);
            box.addChild(left);

            ColorRect right = new ColorRect();
            right.setPosition(new Vector2(w - 1, 0));
            right.setSize(new Vector2(1, h));
            right.setColor(border);
            box.addChild(right);
        }
        return box;
    }

    private static Label createLabel(Control parent, String text, double x, double y, double w, double h, int size, Color col) {
        Label lbl = new Label();
        lbl.setPosition(new Vector2(x, y));
        lbl.setSize(new Vector2(w, h));
        lbl.setText(text);
        LabelSettings s = new LabelSettings();
        s.setFontSize(size);
        s.setFontColor(col);
        lbl.setLabelSettings(s);
        parent.addChild(lbl);
        return lbl;
    }

    private static Label createWrappedLabel(Control parent, String text, double x, double y, double w, double h, int size, Color col) {
        Label lbl = createLabel(parent, text, x, y, w, h, size, col);
        lbl.setAutowrapMode(TextServer.AutowrapMode.WORD_SMART);
        return lbl;
    }

    private static Button createBtn(Control parent, String text, double x, double y, double w, double h, Runnable onClick) {
        Button btn = new Button();
        btn.setPosition(new Vector2(x, y));
        btn.setSize(new Vector2(w, h));
        btn.setText(text);
        btn.setTextAlignment(HorizontalAlignment.CENTER);
        btn.getPressed().connect(LambdaCallable0.create(onClick::run));
        parent.addChild(btn);
        return btn;
    }

    private static void createPolygon(Control parent, Vector2[] vertices, Color color) {
        Polygon2D poly = new Polygon2D();
        poly.setPolygon(new PackedVector2Array(vertices));
        poly.setColor(color);
        parent.addChild(poly);
    }

    private static void createLine(Control parent, Vector2[] vertices, boolean closed, float width, Color color) {
        Line2D line = new Line2D();
        line.setPoints(new PackedVector2Array(vertices));
        line.setClosed(closed);
        line.setWidth(width);
        line.setDefaultColor(color);
        parent.addChild(line);
    }

    private static void clearContainerChildren(Control container) {
        if (container == null) {
            return;
        }
        long count = container.getChildCount();
        for (int i = (int) count - 1; i >= 0; i--) {
            container.getChild(i).queueFree();
        }
    }
}
