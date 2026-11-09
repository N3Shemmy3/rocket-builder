package com.godot.game.core;

/**
 * Tracks Earth Mission Control's campaign progression, cumulative budget savings,
 * astronauts rescued, and cargo delivered.
 */
public final class AgencyState {
    private int currentMissionIndex = 0;
    private long reserveFundsDollars = 0L;
    private int missionsCompleted = 0;
    private int totalAstronautsRescued = 0;
    private double totalCargoDeliveredKg = 0.0;

    public MissionContract getCurrentMission() {
        return MissionCatalog.getMission(currentMissionIndex);
    }

    public boolean isCampaignComplete() {
        return missionsCompleted >= MissionCatalog.getAllMissions().size();
    }

    /**
     * Records a successful mission launch and advances to the next contract.
     */
    public void recordMissionSuccess(RocketBlueprint blueprint, MissionContract contract) {
        long unspentGrant = Math.max(0L, contract.getBudgetLimitDollars() - blueprint.getTotalCostDollars());
        this.reserveFundsDollars += unspentGrant + contract.getRewardDollars();
        this.missionsCompleted++;

        if (contract.getMissionType() == MissionType.ASTRONAUT_RESCUE && blueprint.getPayload() != null) {
            this.totalAstronautsRescued += blueprint.getPayload().getCrewCapacity();
        }
        if (blueprint.getPayload() != null) {
            this.totalCargoDeliveredKg += blueprint.getPayload().getCargoCapacityKg();
        }

        if (currentMissionIndex < MissionCatalog.getAllMissions().size() - 1) {
            currentMissionIndex++;
        }
    }

    public int getCurrentMissionIndex() {
        return currentMissionIndex;
    }

    public void setCurrentMissionIndex(int currentMissionIndex) {
        this.currentMissionIndex = Math.max(0, Math.min(currentMissionIndex, MissionCatalog.getAllMissions().size() - 1));
    }

    public long getReserveFundsDollars() {
        return reserveFundsDollars;
    }

    public int getMissionsCompleted() {
        return missionsCompleted;
    }

    public int getTotalAstronautsRescued() {
        return totalAstronautsRescued;
    }

    public double getTotalCargoDeliveredKg() {
        return totalCargoDeliveredKg;
    }
}
