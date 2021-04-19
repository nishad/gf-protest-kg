<script>
  import * as Factory from "@rdfjs/data-model";
  import Dataset from "@rdfjs/dataset";
  import { Quadstore } from "quadstore";
  import leveljs from "level-js";
  import * as N3  from 'n3'
  import {push} from 'svelte-spa-router'
  import { loaded } from './stores.js';
  import { count } from './stores.js';

  let dataset = Dataset.dataset([]);

  const parser = new N3.Parser();
  fetch("./data/protests.ttl")
    .then((r) => r.text())
    .then((t) => {
      parser.parse(
        t,
        (error, quad, prefixes) => {
          if (quad) {
            // console.log(JSON.stringify(quad));
            dataset.add(quad);
          }
          else {
            // console.log("# Tjhjhl, folks!", prefixes);
            // console.log("dataset", dataset);
            dataset = dataset;
          }
        }
      );
    });
  // $: console.log("dataset", dataset);

  let previousQuads;

  const load = async function () {
    console.log("loading data from store");
    const store = new Quadstore({
      dataFactory: Factory,
      backend: leveljs("quadstore"),
    });
    await store.open();
    //const pattern = {graph: Factory.namedNode('http://ex.com/g')};
    const { items } = await store.get({});
    previousQuads = items;
    items.forEach(quad => dataset.add(quad))
    dataset = dataset //svelte yahee!
    //dataset = Dataset.dataset(items);
    await store.close()
  };
  load().catch((e) => console.log(e));
  const updateStore = async function (currentQuads) {
    if (!previousQuads) return
    const store = new Quadstore({
      dataFactory: Factory,
      backend: leveljs("quadstore"),
    });
    await store.open();
    await store.multiPatch(previousQuads, currentQuads)
    previousQuads = currentQuads
    await store.close()
  }


  $: {
    console.log("dataset", dataset);
    updateStore(Array.from(dataset.quads)).then(() => {console.log('store updated')
    count.update(n => n + 1);
  });
  }

</script>

<main>
  <h4 id="resr">Loading triples</h4>
</main>
