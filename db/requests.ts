import {env} from "cloudflare:workers";
export function requestDb(){if(!env.DB)throw new Error("Storage unavailable");return env.DB;}
