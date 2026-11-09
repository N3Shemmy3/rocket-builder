package com.godot.game.core;

import java.util.List;

/**
 * Campaign missions for Earth Mission Control, escalating in urgency, orbital Delta-V,
 * and budget pressure.
 */
public final class MissionCatalog {

    private static final List<MissionContract> MISSIONS = List.of(
            new MissionContract(
                    "mission_1_leo_resupply",
                    "OP-01: ISS LIFE-SUPPORT DROP",
                    "Low Earth Orbit station 'Horizon-1' is running critically low on CO2 scrubbers and food rations. "
                            + "Assemble a reliable single-stage supply rocket within budget before their reserve filters saturate.",
                    MissionType.RESUPPLY,
                    PayloadType.SUPPLY_CARGO_POD,
                    0,
                    800.0,
                    380.0,
                    4_400.0,
                    7_000_000L,
                    6,
                    8_500_000L
            ),
            new MissionContract(
                    "mission_2_leo_rescue",
                    "OP-02: MAYDAY IN DECAYING ORBIT",
                    "URGENT: Micrometeoroid debris crippled a 2-person orbital maintenance skiff! "
                            + "Their emergency oxygen lasts only 4 days and Congress slashed our emergency budget. "
                            + "You MUST use Surplus/Refurbished parts to launch on time and under budget!",
                    MissionType.ASTRONAUT_RESCUE,
                    PayloadType.CREW_RESCUE_CAPSULE,
                    2,
                    0.0,
                    420.0,
                    4_400.0,
                    5_600_000L,
                    4,
                    9_500_000L
            ),
            new MissionContract(
                    "mission_3_science_array",
                    "OP-03: SOLAR STORM OBSERVATORY",
                    "A coronal mass ejection is brewing. Scientists need the Kepler Orbital Lab Array placed into "
                            + "Medium Earth Orbit (6,200 m/s Delta-V) to track radiation belts. Requires a two-stage rocket!",
                    MissionType.SCIENCE_DELIVERY,
                    PayloadType.SCIENCE_EQUIPMENT,
                    0,
                    1_200.0,
                    2_000.0,
                    6_200.0,
                    11_500_000L,
                    8,
                    14_000_000L
            ),
            new MissionContract(
                    "mission_4_heavy_resupply",
                    "OP-04: GATEWAY EMERGENCY LOGISTICS",
                    "High-orbit staging post 'Gateway-Alpha' lost its primary solar hydroponics bay. "
                            + "Deliver 2,000 kg of heavy logistics cargo to High Earth Orbit under a tight 7-day window.",
                    MissionType.RESUPPLY,
                    PayloadType.SUPPLY_CARGO_POD,
                    0,
                    2_000.0,
                    12_000.0,
                    6_600.0,
                    13_000_000L,
                    7,
                    16_500_000L
            ),
            new MissionContract(
                    "mission_5_cislunar_rescue",
                    "OP-05: APOLLO ECHO — CISLUNAR RESCUE",
                    "FINAL OPERATION: Four astronauts aboard deep-space vessel 'endurance' are stranded in a high cislunar "
                            + "transfer ellipse (7,400 m/s Delta-V). Balance heavy stages and surplus components to bring all four home!",
                    MissionType.ASTRONAUT_RESCUE,
                    PayloadType.CREW_RESCUE_CAPSULE,
                    4,
                    0.0,
                    38_000.0,
                    7_400.0,
                    16_500_000L,
                    9,
                    25_000_000L
            )
    );

    private MissionCatalog() {
    }

    public static List<MissionContract> getAllMissions() {
        return MISSIONS;
    }

    public static MissionContract getMission(int index) {
        return MISSIONS.get(Math.max(0, Math.min(index, MISSIONS.size() - 1)));
    }
}
