'use client';

import * as React from 'react';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type Toast = {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
    [key: string]: any;
};

let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}

type Action =
    | { type: 'ADD_TOAST'; toast: Toast }
    | { type: 'DISMISS_TOAST'; toastId: string }
    | { type: 'REMOVE_TOAST'; toastId: string };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(state: { toasts: Toast[] }) => void> = [];
let memoryState: { toasts: Toast[] } = { toasts: [] };

function dispatch(action: Action) {
    switch (action.type) {
        case 'ADD_TOAST':
            memoryState = { toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT) };
            break;
        case 'DISMISS_TOAST':
        case 'REMOVE_TOAST':
            memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== action.toastId) };
            break;
    }
    listeners.forEach((l) => l(memoryState));
}

function toast(props: Omit<Toast, 'id'>) {
    const id = genId();
    dispatch({ type: 'ADD_TOAST', toast: { ...props, id, open: true } });

    const timeout = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', toastId: id });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(id, timeout);

    return id;
}

function useToast() {
    const [state, setState] = React.useState(memoryState);

    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) listeners.splice(index, 1);
        };
    }, []);

    return { ...state, toast };
}

export { useToast, toast };
