<script>
  import Router from 'svelte-spa-router'
  import { routes } from './routes'
  import { link } from 'svelte-spa-router'
  import active from 'svelte-spa-router/active'
  import {Quadstore} from 'quadstore'
  import * as dataFactory from '@rdfjs/data-model'
  import leveljs from 'level-js';

  document.title = 'George Floyd protests Knowledge Graph'

  if (typeof sbot !== 'undefined') {
    const store = new Quadstore({
        dataFactory,
        backend: leveljs('quadstore'),
      });
    async function reloadStore() {
      await store.open();
      await store.sparql('DELETE { GRAPH ?g { ?s ?p ?o} } WHERE { GRAPH ?g { ?s ?p ?o} }')
      const opts = {
        reverse: false,
        query: [
          {
            $filter: {
              value: {
                content: { type: 'patchgraph-update' }
              }
            }
          }
        ]
      }
      const result = await new Promise((resolve, reject) =>  {
        pull(sbot.query.read(opts), pull.collect(function (err, msgs) {
          function executeSequentially(promises) {
            const last = promises.pop()
            return promises.length === 0 ? last() : executeSequentially(promises).then(() => {
              return last()
            })
          }

          const sequentialPromises = executeSequentially(msgs.map(msg => {
            if (!msg.value) {
              return;
            }
            const sparqlStatement = msg.value.content.value
            return () => store.sparql(sparqlStatement)
          }))
          sequentialPromises.then(() => resolve())
        }))
      })
      return result
    }
    reloadStore()
  }
</script>

<style>
  ul#menu li {
    display: inline;
  }

  ul#menu li:not(:first-child) ::before {
    content: " » ";
  }
  :global(a.active) {
    color: red;
  }
  :global(h1) {
    color: #0066ff;
    font-size: 2em;
    font-weight: 100;
  }
</style>

<ul id="menu">
  <li><a href="/" use:link use:active>Home</a></li>
  <li><a href="/load" use:link use:active>Load Triples</a></li>
  <li><a href="/sparql" use:link use:active>Query with SPARQL</a></li>
</ul>

<Router {routes} />

