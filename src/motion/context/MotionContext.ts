import { createContext, useMemo } from "react"
import { ComponentAnimationControls } from "../../animation/ComponentAnimationControls"
import { VariantLabels, MotionProps } from "../types"
import { Target } from "../../types"
import { useMaxTimes } from "../../utils/use-max-times"

type MotionContextProps = {
    controls?: ComponentAnimationControls
    initial?: VariantLabels
    static?: boolean
}

/**
 * @internal
 */
export const MotionContext = createContext<MotionContextProps>({
    static: false,
})

const isTarget = (v?: MotionProps["animate"]): v is Target => {
    return v !== undefined && typeof v !== "string" && !Array.isArray(v)
}

export const useMotionContext = (
    parentContext: MotionContextProps,
    controls: ComponentAnimationControls,
    isStatic: boolean = false,
    initial?: MotionProps["initial"],
    animate?: MotionProps["animate"]
) => {
    const targetInitial =
        initial && !isTarget(initial) ? initial : parentContext.initial
    const initialDep = isStatic ? targetInitial : null // Only trigger updates if static and initial has changed
    const animateDep = isTarget(animate) ? null : animate // Only trigger update if it's a variant label and it changes
    const context: MotionContextProps = useMemo(
        () => ({
            controls,
            initial: targetInitial,
        }),
        [initialDep, animateDep]
    )

    context.static = isStatic

    // Set initial state. If this is a static component (ie in Framer canvas), respond to updates
    // in `initial`
    useMaxTimes(
        () => {
            const initialToApply = initial || parentContext.initial

            initialToApply && controls.apply(initialToApply)
        },
        isStatic ? Infinity : 1
    )

    return context
}
