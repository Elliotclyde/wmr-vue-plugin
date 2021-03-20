# wmr-vue-plugin
A plugin for wmr for vue SFCs

![warning](https://th.bing.com/th/id/Rb1eec92f370f8d52f86bf04fc9086bcf?rik=k8h0GOdpMYE6UQ&riu=http%3a%2f%2fcdn.onlinewebfonts.com%2fsvg%2fdownload_515232.png&ehk=Eov%2bGcAU2ks2IP%2bhMGkdyBAstYg%2frw9Yx94ZTxHmuoI%3d&risl=&pid=ImgRaw)

## Important: At the moment this is a proof of concept and it only works in the build step

This is basically just a simplified version of the Vue SFC rollup plugin and won't work in the wmr dev server. 

## Usage

This isn't on npm yet but it's going to be very easy to include in your codebase:

1. Install dependencies: `npm install @vue/compiler-sfc hash-sum`
2. Copy the contents of wmr-vue-plugin into a file file at the root of your project named `vue-plugin.js`
3. Create a `wmr.config.js` file and add:

`
// wmr.config.js
import vue from "./vue-plugin.js";
export default async function (config) {
  config.plugins.push(
    // add any Rollup plugins:
    vue()
  );
}
`
That's it! Now you can write single file components and they will render in the build step.
