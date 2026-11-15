import { useCallback, useEffect, useRef, useState } from 'react';
import { PARTS } from '../data/parts';
import { AssemblyBay } from './AssemblyBay';
import { FlightScene } from './FlightScene';
import { PadStatus } from './PadStatus';
import { PartMiniSvg } from './PartMiniSvg';

const DRAG_THRESHOLD_PX = 5;
const GHOST_MARGIN_PX = 8;
const DEFAULT_GHOST_WIDTH = 138;
const DEFAULT_GHOST_HEIGHT = 118;

function isPointInsideRect(x, y, rect) {
  if (!rect) return false;
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function getGhostStatusLabel(
  partKey,
  source,
  isOverScene,
  isOverBay,
  installedSet
) {
  const part = PARTS[partKey];
  if (source === 'rocket') {
    return isOverBay || !isOverScene ? 'DROP TO DETACH' : 'DRAG TO BAY';
  }
  if (installedSet.has(partKey)) {
    return 'ALREADY MOUNTED';
  }
  if (isOverScene) {
    return 'RELEASE TO MOUNT';
  }
  return `TO ${part?.stageRole ?? 'PAD'}`;
}

export function BuildColumn({
  mission,
  launched,
  stats,
  flight,
  installedSet,
  surplusSet,
  onSetInstalled,
  onToggleSurplus,
  onTelemetryLog,
}) {
  const sceneRef = useRef(null);
  const bayRef = useRef(null);
  const ghostRef = useRef(null);
  const dragSessionRef = useRef(null);
  const suppressClickRef = useRef(false);

  const [dragUi, setDragUi] = useState(null);
  const [inspected, setInspected] = useState(null);
  const [hoveredRocketPart, setHoveredRocketPart] = useState(null);

  const latestRef = useRef({
    flightActive: flight.active,
    installedSet,
    onSetInstalled,
    onTelemetryLog,
  });
  latestRef.current = {
    flightActive: flight.active,
    installedSet,
    onSetInstalled,
    onTelemetryLog,
  };

  const clampGhostPosition = useCallback((clientX, clientY, offsetX, offsetY) => {
    const ghostWidth = ghostRef.current?.offsetWidth || DEFAULT_GHOST_WIDTH;
    const ghostHeight = ghostRef.current?.offsetHeight || DEFAULT_GHOST_HEIGHT;
    const maxLeft = Math.max(
      GHOST_MARGIN_PX,
      window.innerWidth - ghostWidth - GHOST_MARGIN_PX
    );
    const maxTop = Math.max(
      GHOST_MARGIN_PX,
      window.innerHeight - ghostHeight - GHOST_MARGIN_PX
    );

    return {
      left: Math.max(GHOST_MARGIN_PX, Math.min(clientX - offsetX, maxLeft)),
      top: Math.max(GHOST_MARGIN_PX, Math.min(clientY - offsetY, maxTop)),
    };
  }, []);

  const getDropZones = useCallback((clientX, clientY) => {
    const sceneRect = sceneRef.current?.getBoundingClientRect() ?? null;
    const bayRect = bayRef.current?.getBoundingClientRect() ?? null;
    const isOverScene = isPointInsideRect(clientX, clientY, sceneRect);
    const isOverBay = isPointInsideRect(clientX, clientY, bayRect);
    return {
      isOverScene,
      isOverBay,
    };
  }, []);

  const clearDragSession = useCallback(() => {
    const session = dragSessionRef.current;
    if (session?.captureTarget && session.pointerId != null) {
      try {
        if (session.captureTarget.hasPointerCapture?.(session.pointerId)) {
          session.captureTarget.releasePointerCapture(session.pointerId);
        }
      } catch {
        // Ignore release failures if element detached or capture already ended.
      }
    }
    dragSessionRef.current = null;
    document.documentElement.classList.remove('is-dragging-part');
    setDragUi(null);
  }, []);

  const cancelActiveDrag = useCallback(
    (announce = true) => {
      const session = dragSessionRef.current;
      if (!session) return;
      const wasDragging = session.isDragging;
      const partCode = PARTS[session.partKey]?.code ?? session.partKey;
      clearDragSession();
      if (wasDragging && announce) {
        latestRef.current.onTelemetryLog?.(
          `[ASSEMBLY] Cancelled ${partCode} drag operation.`
        );
      }
    },
    [clearDragSession]
  );

  useEffect(() => {
    if (flight.active) {
      cancelActiveDrag(false);
      setInspected(null);
      setHoveredRocketPart(null);
    }
  }, [flight.active, cancelActiveDrag]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      session.clientX = event.clientX;
      session.clientY = event.clientY;

      if (!session.isDragging) {
        const dist = Math.hypot(
          event.clientX - session.startX,
          event.clientY - session.startY
        );
        if (dist < DRAG_THRESHOLD_PX) return;
        session.isDragging = true;
        document.documentElement.classList.add('is-dragging-part');
        setInspected(null);
        setHoveredRocketPart(null);
      }

      const { left, top } = clampGhostPosition(
        event.clientX,
        event.clientY,
        session.offsetX,
        session.offsetY
      );
      const { isOverScene, isOverBay } = getDropZones(
        event.clientX,
        event.clientY
      );

      setDragUi({
        partKey: session.partKey,
        source: session.source,
        left,
        top,
        isOverScene,
        isOverBay,
      });
    };

    const handlePointerUp = (event) => {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      const { partKey, source, isDragging } = session;
      const { isOverScene, isOverBay } = getDropZones(
        event.clientX,
        event.clientY
      );
      clearDragSession();

      if (!isDragging) return;

      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);

      const {
        installedSet: currentInstalled,
        onSetInstalled: setPartInstalled,
      } = latestRef.current;

      if (source === 'bay') {
        if (isOverScene) {
          setPartInstalled(partKey, true);
        }
        return;
      }

      if (source === 'rocket') {
        if (currentInstalled.has(partKey) && (isOverBay || !isOverScene)) {
          setPartInstalled(partKey, false);
        }
      }
    };

    const handlePointerCancel = (event) => {
      const session = dragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      cancelActiveDrag(false);
    };

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (dragSessionRef.current?.isDragging) {
        event.preventDefault();
        cancelActiveDrag(true);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('keydown', handleKeyDown);
      clearDragSession();
    };
  }, [clampGhostPosition, getDropZones, clearDragSession, cancelActiveDrag]);

  const startPointerDrag = useCallback((partKey, source, event) => {
    if (latestRef.current.flightActive) return;
    if (event.button !== 0) return;
    if (dragSessionRef.current) return;

    if (source === 'rocket' && !latestRef.current.installedSet.has(partKey)) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX =
      source === 'bay'
        ? Math.min(
            Math.max(16, event.clientX - rect.left),
            DEFAULT_GHOST_WIDTH - 20
          )
        : DEFAULT_GHOST_WIDTH / 2;
    const offsetY =
      source === 'bay'
        ? Math.min(
            Math.max(16, event.clientY - rect.top),
            DEFAULT_GHOST_HEIGHT - 20
          )
        : DEFAULT_GHOST_HEIGHT / 2;

    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Ignore synthetic events where pointer capture is unavailable.
    }

    dragSessionRef.current = {
      pointerId: event.pointerId,
      partKey,
      source,
      startX: event.clientX,
      startY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY,
      offsetX,
      offsetY,
      isDragging: false,
      captureTarget: event.currentTarget,
    };
  }, []);

  const handleSlotPointerDown = useCallback(
    (partKey, event) => {
      startPointerDrag(partKey, 'bay', event);
    },
    [startPointerDrag]
  );

  const handleRocketPartPointerDown = useCallback(
    (partKey, event) => {
      startPointerDrag(partKey, 'rocket', event);
    },
    [startPointerDrag]
  );

  const handleSlotClickHint = useCallback((partKey, event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }

    const part = PARTS[partKey];
    if (latestRef.current.installedSet.has(partKey)) {
      latestRef.current.onTelemetryLog?.(
        `[ASSEMBLY] Drag ${part.code} off the rocket to the Assembly Bay to detach it.`
      );
    } else {
      latestRef.current.onTelemetryLog?.(
        `[ASSEMBLY] Drag ${part.code} (${part.name}) onto the launch pad to mount it.`
      );
    }
  }, []);

  const handleInspectStart = useCallback((partKey, x, y) => {
    if (dragSessionRef.current?.isDragging) return;
    setInspected({ partKey, pointer: { x, y } });
  }, []);

  const handleInspectMove = useCallback((partKey, x, y) => {
    if (dragSessionRef.current?.isDragging) return;
    setInspected({ partKey, pointer: { x, y } });
  }, []);

  const handleInspectEnd = useCallback(() => {
    setInspected(null);
  }, []);

  const handleRocketPartPointerEnter = useCallback(
    (partKey, event) => {
      if (dragSessionRef.current?.isDragging) return;
      setHoveredRocketPart(partKey);
      handleInspectStart(partKey, event.clientX, event.clientY);
    },
    [handleInspectStart]
  );

  const handleRocketPartPointerMove = useCallback(
    (partKey, event) => {
      if (dragSessionRef.current?.isDragging) return;
      setHoveredRocketPart(partKey);
      handleInspectMove(partKey, event.clientX, event.clientY);
    },
    [handleInspectMove]
  );

  const handleRocketPartPointerLeave = useCallback(() => {
    setHoveredRocketPart(null);
    handleInspectEnd();
  }, [handleInspectEnd]);

  const handleNativeDragOver = useCallback((event) => {
    if (latestRef.current.flightActive) return;
    event.preventDefault();
  }, []);

  const handleNativeDrop = useCallback((event, zone) => {
    if (latestRef.current.flightActive) return;
    event.preventDefault();
    const partKey = event.dataTransfer?.getData('text/plain');
    if (!partKey || !PARTS[partKey]) return;
    latestRef.current.onSetInstalled(partKey, zone === 'rocket');
  }, []);

  const ghostPart = dragUi ? PARTS[dragUi.partKey] : null;
  const ghostStatus = dragUi
    ? getGhostStatusLabel(
        dragUi.partKey,
        dragUi.source,
        dragUi.isOverScene,
        dragUi.isOverBay,
        installedSet
      )
    : null;
  const isGhostReady = dragUi
    ? (dragUi.source === 'bay' &&
        !installedSet.has(dragUi.partKey) &&
        dragUi.isOverScene) ||
      (dragUi.source === 'rocket' &&
        (dragUi.isOverBay || !dragUi.isOverScene))
    : false;

  return (
    <section className="build-column" aria-label="Rocket assembly">
      <PadStatus
        launched={launched}
        mass={stats.mass}
        stages={stats.stages}
        heightM={stats.heightM}
        surplusCount={stats.reusedCount}
      />
      <FlightScene
        mission={mission}
        flight={flight}
        installed={installedSet}
        sceneRef={sceneRef}
        activeDragPart={dragUi?.partKey ?? null}
        dragSource={dragUi?.source ?? null}
        isOverTargetSlot={dragUi?.isOverScene ?? false}
        hoveredRocketPart={hoveredRocketPart}
        onRocketPartPointerDown={handleRocketPartPointerDown}
        onRocketPartPointerEnter={handleRocketPartPointerEnter}
        onRocketPartPointerMove={handleRocketPartPointerMove}
        onRocketPartPointerLeave={handleRocketPartPointerLeave}
        onNativeDragOver={handleNativeDragOver}
        onNativeDrop={handleNativeDrop}
      />
      <AssemblyBay
        installedSet={installedSet}
        surplusSet={surplusSet}
        bayRef={bayRef}
        activeDragPart={dragUi?.partKey ?? null}
        dragSource={dragUi?.source ?? null}
        isOverBay={dragUi?.isOverBay ?? false}
        inspected={inspected}
        onToggleSurplus={onToggleSurplus}
        onSlotPointerDown={handleSlotPointerDown}
        onSlotClickHint={handleSlotClickHint}
        onInspectStart={handleInspectStart}
        onInspectMove={handleInspectMove}
        onInspectEnd={handleInspectEnd}
        onNativeDragOver={handleNativeDragOver}
        onNativeDrop={handleNativeDrop}
      />
      {dragUi && ghostPart && (
        <div
          ref={ghostRef}
          className={`part-drag-ghost${isGhostReady ? ' ready' : ''}${
            dragUi.source === 'rocket' ? ' detach' : ''
          }`}
          style={{
            transform: `translate3d(${dragUi.left}px, ${dragUi.top}px, 0)`,
          }}
          aria-hidden="true"
        >
          <PartMiniSvg partKey={dragUi.partKey} code={ghostPart.code} />
          <span className="ghost-code">{ghostPart.code}</span>
          <span className="ghost-name">{ghostPart.name}</span>
          <span className="ghost-status">{ghostStatus}</span>
        </div>
      )}
    </section>
  );
}
