import Entry from './Entry.svelte';
import Load from './Load.svelte';
import Sparql from './Sparql.svelte';

const routes = {
    '/': Entry,
    '/index.html': Entry,
    '/load': Load,
    '/sparql': Sparql,
    '*': Entry,
};
export { routes };
