package com.godot.game.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Master catalog of rocket components available to Earth Mission Control.
 * Each base part is Factory New and can be converted to a Surplus/Refurbished part via {@link RocketPart#asSurplus()}.
 */
public final class PartCatalog {

    private static final List<RocketPart> PAYLOADS = List.of(
            new RocketPart(
                    "payload_supply_basic",
                    "Hermes Supply Pod Mk1",
                    "Standard pressurized cargo container carrying emergency rations, water, and CO2 scrubbers.",
                    PartCategory.PAYLOAD,
                    PartCondition.FACTORY_NEW,
                    2_000_000L,
                    2,
                    1_200.0,
                    0.0,
                    0.0,
                    0.0,
                    0.99,
                    PayloadType.SUPPLY_CARGO_POD,
                    0,
                    800.0
            ),
            new RocketPart(
                    "payload_rescue_leo",
                    "Valkyrie 2-Seat Lifeboat",
                    "Compact orbital reentry capsule outfitted with two rescue couches and emergency life support.",
                    PartCategory.PAYLOAD,
                    PartCondition.FACTORY_NEW,
                    3_500_000L,
                    3,
                    1_800.0,
                    0.0,
                    0.0,
                    0.0,
                    0.98,
                    PayloadType.CREW_RESCUE_CAPSULE,
                    2,
                    200.0
            ),
            new RocketPart(
                    "payload_science_sat",
                    "Kepler Orbital Lab Array",
                    "High-precision spectrometer and microgravity research rack for orbital station integration.",
                    PartCategory.PAYLOAD,
                    PartCondition.FACTORY_NEW,
                    3_200_000L,
                    3,
                    1_600.0,
                    0.0,
                    0.0,
                    0.0,
                    0.98,
                    PayloadType.SCIENCE_EQUIPMENT,
                    0,
                    1_200.0
            ),
            new RocketPart(
                    "payload_supply_heavy",
                    "Atlas Heavy Logistics Module",
                    "Heavy-duty orbital resupply module packed with hydroponics, medical bays, and spare thrusters.",
                    PartCategory.PAYLOAD,
                    PartCondition.FACTORY_NEW,
                    4_200_000L,
                    3,
                    2_500.0,
                    0.0,
                    0.0,
                    0.0,
                    0.99,
                    PayloadType.SUPPLY_CARGO_POD,
                    0,
                    2_000.0
            ),
            new RocketPart(
                    "payload_rescue_deep",
                    "Orion-Lite 4-Seat Recovery Pod",
                    "Deep-space radiation-shielded crew capsule capable of returning four stranded astronauts.",
                    PartCategory.PAYLOAD,
                    PartCondition.FACTORY_NEW,
                    5_500_000L,
                    4,
                    2_800.0,
                    0.0,
                    0.0,
                    0.0,
                    0.98,
                    PayloadType.CREW_RESCUE_CAPSULE,
                    4,
                    400.0
            )
    );

    private static final List<RocketPart> UPPER_STAGES = List.of(
            new RocketPart(
                    "upper_light",
                    "Centaur-Mini Vacuum Stage",
                    "Compact second stage with a vacuum-optimized nozzle for medium and high Earth orbits.",
                    PartCategory.UPPER_STAGE,
                    PartCondition.FACTORY_NEW,
                    2_200_000L,
                    2,
                    1_000.0,
                    6_000.0,
                    120.0,
                    345.0,
                    0.97,
                    null,
                    0,
                    0.0
            ),
            new RocketPart(
                    "upper_heavy",
                    "Cryo-Star High-Energy Stage",
                    "High-efficiency cryogenic upper stage built for geostationary and cislunar injections.",
                    PartCategory.UPPER_STAGE,
                    PartCondition.FACTORY_NEW,
                    4_200_000L,
                    3,
                    1_800.0,
                    14_000.0,
                    240.0,
                    380.0,
                    0.96,
                    null,
                    0,
                    0.0
            )
    );

    private static final List<RocketPart> BOOSTER_TANKS = List.of(
            new RocketPart(
                    "tank_small",
                    "Redstone-X Light Tank",
                    "Aluminum-lithium first-stage propellant tank ideal for light LEO payloads.",
                    PartCategory.BOOSTER_TANK,
                    PartCondition.FACTORY_NEW,
                    2_000_000L,
                    2,
                    2_500.0,
                    22_000.0,
                    0.0,
                    0.0,
                    0.99,
                    null,
                    0,
                    0.0
            ),
            new RocketPart(
                    "tank_medium",
                    "Titan-Core Medium Tank",
                    "Workhorse first-stage propellant tank capable of lifting multi-stage orbital stacks.",
                    PartCategory.BOOSTER_TANK,
                    PartCondition.FACTORY_NEW,
                    3_600_000L,
                    3,
                    4_200.0,
                    48_000.0,
                    0.0,
                    0.0,
                    0.98,
                    null,
                    0,
                    0.0
            ),
            new RocketPart(
                    "tank_heavy",
                    "Saturn-Vibe Heavy Cryo Tank",
                    "Massive first-stage propellant core engineered for heavy deep-space launches.",
                    PartCategory.BOOSTER_TANK,
                    PartCondition.FACTORY_NEW,
                    6_000_000L,
                    4,
                    7_500.0,
                    95_000.0,
                    0.0,
                    0.0,
                    0.97,
                    null,
                    0,
                    0.0
            )
    );

    private static final List<RocketPart> ENGINES = List.of(
            new RocketPart(
                    "engine_kero_basic",
                    "Kestrel-1 Kerolox Engine",
                    "Simple gas-generator kerosene engine. Affordable and quick to bolt onto light boosters.",
                    PartCategory.ENGINE,
                    PartCondition.FACTORY_NEW,
                    2_400_000L,
                    2,
                    1_100.0,
                    0.0,
                    480.0,
                    295.0,
                    0.98,
                    null,
                    0,
                    0.0
            ),
            new RocketPart(
                    "engine_methalox_mid",
                    "Raptor-Lite Methalox Cluster",
                    "High-pressure methane booster engine delivering strong liftoff thrust and solid efficiency.",
                    PartCategory.ENGINE,
                    PartCondition.FACTORY_NEW,
                    4_400_000L,
                    3,
                    1_900.0,
                    0.0,
                    1_100.0,
                    325.0,
                    0.97,
                    null,
                    0,
                    0.0
            ),
            new RocketPart(
                    "engine_heavy_lifter",
                    "Vulcan-9 Twin-Chamber Lifter",
                    "Monster dual-turbopump main engine capable of heaving heavy two-stage stacks off the pad.",
                    PartCategory.ENGINE,
                    PartCondition.FACTORY_NEW,
                    7_000_000L,
                    4,
                    3_400.0,
                    0.0,
                    2_100.0,
                    335.0,
                    0.96,
                    null,
                    0,
                    0.0
            )
    );

    private PartCatalog() {
    }

    public static List<RocketPart> getPayloads() {
        return PAYLOADS;
    }

    public static List<RocketPart> getUpperStages() {
        return UPPER_STAGES;
    }

    public static List<RocketPart> getBoosterTanks() {
        return BOOSTER_TANKS;
    }

    public static List<RocketPart> getEngines() {
        return ENGINES;
    }

    public static List<RocketPart> getAllFactoryParts() {
        List<RocketPart> all = new ArrayList<>();
        all.addAll(PAYLOADS);
        all.addAll(UPPER_STAGES);
        all.addAll(BOOSTER_TANKS);
        all.addAll(ENGINES);
        return Collections.unmodifiableList(all);
    }

    public static Optional<RocketPart> findById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        boolean surplusRequested = id.endsWith("_surplus");
        String baseId = surplusRequested ? id.substring(0, id.length() - "_surplus".length()) : id;
        for (RocketPart part : getAllFactoryParts()) {
            if (part.getId().equals(baseId)) {
                return Optional.of(surplusRequested ? part.asSurplus() : part);
            }
        }
        return Optional.empty();
    }
}
