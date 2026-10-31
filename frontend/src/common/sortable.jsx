import React from "react";
import {KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import IconButton from "@mui/material/IconButton";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

// mouse/touch drags start after a few pixels (so clicks still work); keyboard: space to pick up, arrows to move
export function useDragSensors() {
    return useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 4}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
    );
}

// attributes, listeners and activatorRef (setActivatorNodeRef) come from useSortable
export function DragHandle({attributes, listeners, activatorRef, label, size = "small"}) {
    return (
        <IconButton ref={activatorRef} {...attributes} {...listeners} size={size}
                    aria-label={label} onClick={(e) => e.stopPropagation()}
                    sx={{cursor: "grab", touchAction: "none", color: "text.secondary", "&:active": {cursor: "grabbing"}}}>
            <DragIndicatorIcon fontSize="small"/>
        </IconButton>
    );
}
