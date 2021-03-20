# wmr-vue-plugin
A plugin for wmr for vue SFCs

![warning](https://ubcomputerlab.files.wordpress.com/2011/09/warning_sign_bold.png?w=150)

## Important: At the moment this is a proof of concept and it only works in the build step

This is basically just a simplified version of the Vue SFC rollup plugin and won't work in the wmr dev server. However, it does allow you to include Vue SFCs in the build step of your wmr project.

## Usage

This isn't on npm yet but it's going to be very easy to include in your codebase:

1. Install dependencies: `npm install @vue/compiler-sfc hash-sum`
2. Copy the contents of wmr-vue-plugin into a file file at the root of your project named `vue-plugin.js`
3. Create a `wmr.config.js` file and add:

```
// wmr.config.js
import vue from "./vue-plugin.js";
export default async function (config) {
  config.plugins.push(
    // add any Rollup plugins:
    vue()
  );
}
```

That's it! Now you can write single file components and they will render in the build step.
