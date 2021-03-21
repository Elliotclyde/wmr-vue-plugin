# wmr-vue-plugin
A plugin for wmr for vue SFCs.

This does not yet support HMR. It also assumes you're hosting your dev environment from a public directory. 

This should not be used in production as it's very much untested. PRs are very welcome. 

## Usage

Here's how you can include it in your codebase:

1. Install dependencies: `npm install @vue/compiler-sfc hash-sum vue@next`
2. Copy the contents of wmr-vue-plugin into a file file at the root of your project named `vue-plugin.js`
3. Create a `wmr.config.js` file and add:

```
// wmr.config.js

import { buildVue, devVue } from "./vue-plugin.js";

export default async function (config) {
  if (config.mode === "build") {
    config.plugins.push(
      // add any Rollup plugins:
      buildVue()
    );
  }
  if (config.mode === "start") {
    config.middleware.push(devVue);
  }
}
```

That's it! Now you can write single file components in wmr.
