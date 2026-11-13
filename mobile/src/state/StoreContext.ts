import {createContext} from 'react';
import type {Store} from './AppStore';
export const StoreContext=createContext<Store|null>(null);
