import {useEffect, useRef} from 'react'

export default function useBackGesture(
    onClose,
    stateName = 'backGestureState',
    deps = [],
) {
    const pushedStateRef = useRef(false)

    useEffect(() => {
        const handleBackAction = () => {
            if (pushedStateRef.current || window.history.state?.[stateName]) {
                pushedStateRef.current = false
                window.history.replaceState({}, '')
                onClose?.()
            }
        }

        if (!pushedStateRef.current && !window.history.state?.[stateName]) {
            pushedStateRef.current = true
            window.history.pushState({[stateName]: true}, '')
            window.addEventListener('popstate', handleBackAction)
        }

        return () => {
            if (pushedStateRef.current && window.history.state?.[stateName]) {
                pushedStateRef.current = false
                window.history.replaceState({}, '')
            }
            window.removeEventListener('popstate', handleBackAction)
        }
    }, [...deps])
}
