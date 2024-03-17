---
title: How to tackle compatibility issues in ECMA Script modules (and in general)
category: "TypeScript"
cover: 2024-03-09-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![cover](2024-03-09-cover.png)

**Do you recall moments when you're sitting and closing dozens or more browser tabs?** Most of them are Google, GitHub, Blogs, and others. You click and close them one by one, not even checking if they're worth keeping. That's a sign you learned more about the problem than you ever wanted. But that also means that you solved it. If you didn't, you'd just add more open tabs. I have that feeling fresh now.

Yesterday, I solved one of those types of issues. It's not so surprising knowing that I [just started Emmett](/pl/introducing_emmett/), a JS/TS library for event-driven applications. JavaScript Land has a lot of rabbit holes. And boy, you can go down in them! 

JavaScript can be seen as wild, but at least they have the ECMAScript specification that unifies standards. It's widely discussed before acceptance but also inert in application. 

**For instance, ES Modules (ECMAScript Modules) were introduced in ECMAScript 6 (ES6) in [2015](https://262.ecma-international.org/6.0/).** Yes, the year when Netflix released Narcos, Jon Snow died, and Bruno Mars' Uptown Funk was on top of Billboard charts. Nice memories? Guess what? For the JS community, they're still fresh, as migration to ES Modules is still ongoing.

## ES Modules

What are ES Modules? They brought a standardised module system to JavaScript, addressing several limitations of the previously widely used module patterns (such as CommonJS and AMD). ES Modules were introduced for several reasons:

1. **Standardisation:** Before ES Modules, the JavaScript ecosystem was fragmented with multiple module systems (e.g., CommonJS for Node.js and AMD for asynchronous module loading in browsers). ES Modules provide a single, standardised module system used across different environments, enhancing interoperability.
2. **Static Analysis and Tree Shaking** ES Modules support static analysis, allowing tools to perform optimisations such as tree shaking (eliminating unused code) due to their static structure (import and export statements are at the top level and cannot be conditional).
3. **Improved Performance:** Due to the possibility of static analysis, JavaScript engines can optimise the loading and bundling of modules more efficiently, potentially improving load times and execution performance.
4. **Better Code Organization.** ES Modules encourage a more modular and maintainable code structure, making it easier to develop, understand, and maintain large codebases.
5. **Native Browser Support.** ES Modules are natively supported in modern browsers, allowing modules to be used directly without needing module bundlers or transpilers.

All that sounds great, but migration can be tedious. You need to change not only your build tooling but also the syntax in the code. For instance, in CommonJS, your module declaration could look like:

```javascript
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = { add, subtract };
```

And usage with imports as:

```javascript
const math = require('./math');

console.log(math.add(2, 3));
console.log(math.subtract(5, 2));
```

In ES modules, the declaration looks:

```javascript
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
```

And usage:

```javascript
import { add, subtract } from './math.js';

console.log(add(2, 3));
console.log(subtract(5, 2));
```

With [AMD](https://requirejs.org/docs/whyamd.html#amd), the leap is even bigger. So yeah, essentially, you need to go through all files and gradually migrate. For known reasons, that's hard and takes time. Not always that's justified financial-wise. The library creators have to support both, which, for obvious reasons, is tricky.

Do you know [Quines](https://en.wikipedia.org/wiki/Quine_(computing))? Per Wikipedia:

> A quine is a computer program that takes no input and produces a copy of its own source code as its only output. 

The variations of quines are Ouroboros programs:

> The quine concept can be extended to multiple levels of recursion, giving rise to "ouroboros programs", or quine-relays. This should not be confused with multiquines. 

There are people, like Yusuke Endoh, that do things like [Quine Relay](https://github.com/mame/quine-relay):

> QR.rb is a Ruby program that generates a Rust program that generates a Scala program that generates ...(through 128 languages in total)... a REXX program that generates the original Ruby code again.

Yeah, people are having fun. 

In JS land, you might not have fun, but you may need to write your quines. How do you write code that supports both styles, CommonJS and ES Modules? There are multiple options. You can use:
- separate file extensions _.mjs_ for ES Modules and _.js_ for CommonJS,
- TypeScript and ask the TS compiler to generate files compatible with both. That's nice, as TypeScript is ECMA Script compatible by itself.
- bundlers that shake and bake and deliver nice code to you.

Sweet, but all has its price. Having multiple files for the same code might lead to the dual package hazard, where both versions of your package could be loaded simultaneously, potentially leading to bugs and bloated bundles. If you're a package creator, then that means your life gets wilder from time to time. Package Creator? Yeah, that's me. 

## Issues with ES Modules

Getting back to my closing browser tabs habit. 

I recently released [several of Emmett's versions](https://github.com/event-driven-io/emmett/releases/). They brought:
- [EventStoreDB](https://developers.eventstore.com/) support,
- Integration and Acceptance testing for WebAPI,
- basic [Fastify](https://fastify.dev/) support,
- state time travelling capabilities,
- and more.

I was happy and kinda proud as external contributors delivered some of those changes. That's motivating, especially in the early phases of the OSS project. But happiness has its deadline. For OSS, this deadline comes when someone tries to use a brand-new version.

[Emmett appears incompatible with ES Modules](https://github.com/event-driven-io/emmett/issues/38). That was surprising, as I was using them in the code, and I thought I had configured that correctly. Famous last words!

While importing, you got:

```bash
import { getInMemoryEventStore } from '@event-driven-io/emmett';
         ^^^^^^^^^^^^^^^^^^^^^
SyntaxError: Named export 'getInMemoryEventStore' not found. The requested module '@event-driven-io/emmett' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from '@event-driven-io/emmett';
const { getInMemoryEventStore } = pkg;

    at ModuleJob._instantiate (node:internal/modules/esm/module_job:132:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:214:5)
    at async ModuleLoader.import (node:internal/modules/esm/loader:329:24)
    at async loadESM (node:internal/process/esm_loader:28:7)
    at async handleMainPromise (node:internal/modules/run_main:113:12)
```

Of course, I couldn't reproduce that locally, but _"works on my box!"_ isn't the answer your users would expect. So, I had to dig deeper. I'm using TypeScript. I checked the generated files, and they seemed fine. They had all those _.js_, _.mjs_, _.ts_, _.mts_ files, etc. Yet, I found the potential issue in those closed tabs. I didn't give a hint about which files are entry points for CommonJS imports and which for ES Modules.

Essentially, you need to declare it in your _package.json_ file like this:

```json
{
  "name": "@event-driven-io/emmett",
  "description": "Emmett - Event Sourcing development made simple",
  // (...)
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  },
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
}
```

Now, when someone uses _require_ syntax from CommonJS, it goes to the _js_ and _ts_ files; if someone uses ES Modules, it goes to _ts_ and _mts_. That's cool, but I wasn't still able to reproduce it. 

Providing a quick fix is fine, but if you don't know how to verify it, it is not a fix; it's a rumour. That can lead to regression when you introduce a new change that breaks it again. 

I wouldn't like to have that. A good indicator of the OSS community quality is the engagement from users. And it sounds like Emmett already has a thriving community. [I got reproducible steps with a project](https://github.com/event-driven-io/emmett/issues/40); Thanks [Mateusz](https://github.com/stepaniukm)! But yeah, one problem solved, and a new one appears. Mateusz confirmed my suspicion about the missing exports in _package.json_ was correct; that solved one issue, but another one popped up for him. Of we go to detective work, thanks again, Mateusz!

The next problem was:

```bash
Directory import 'emmett/packages/emmett/dist/commandHandling' is not supported resolving ES modules imported from emmett/packages/emmett/dist/index.mjs
```

I'm exporting them to the root _'.'_ to provide a straightforward entry point for Emmett's features without searching through nested structures. You can import all code like:

```typescript
import type { Event, Command } from '@event-driven-io/emmett';
import { IllegalStateError, CommandHandler } from '@event-driven-io/emmett';
```

Yet, of course, I don't keep all the source codes in a single file; [I have a nested structure](https://github.com/event-driven-io/emmett/tree/main/packages/emmett/src). I'm using a feature called _"re-exporting"_ to achieve that. Essentially, I have a default _index.ts_ file in a directory that imports files from subdirectories and exports them again under the flattened structure. This can look like that:

```typescript
export * from './commandHandling';
export * from './errors';
export * from './eventStore';
export * from './serialization';
export * from './testing';
export * from './typing';
export * from './utils';
export * from './validation';
```

And here's the deal. When working with TypeScript (_.ts_, _.tsx_) and ECMAScript Modules (_.mjs_) in Node.js, you might encounter challenges due to the differences in file extensions and module resolution between TypeScript and JavaScript, particularly when using _export *_ from syntax. 

TypeScript introduced _.mts_ as the file extension for ECMAScript modules containing TypeScript code, aligning with _.mjs_ for JavaScript ECMAScript modules. Yet, you may face the following issues:

1. **Module Resolution:** Node.js treats _.mjs_ files as ES modules natively. TypeScript's _.mts_ extension for ES module files also aligns with this convention. However, when importing or re-exporting from these modules, you might encounter issues where TypeScript or Node.js can only correctly resolve the other module type with explicit hints.
2. **Type Definitions:** When using export * from in TypeScript to re-export ES module contents from a _.mjs_ file, TypeScript may not be able to apply the correct types unless those types are explicitly declared or inferred from .d.ts (declaration files). This can lead to type-checking issues.
3. **Tooling and Build Processes:** Tooling might need additional configuration to handle _.mts_ and _.mjs_ files correctly, especially when both TypeScript and JavaScript modules are mixed in a project. This includes setting up TypeScript, bundlers (Webpack, Rollup), and other tools (Babel) to recognise and process these files appropriately.
4. **Path Importing and File Extensions:** TypeScript and Node.js have different default behaviours regarding file extensions. TypeScript might require explicit extensions (e.g., _.mts_) in import statements, which is not always true for _.mjs_ in Node.js due to its native module resolution strategy.

Plenty of options to make it wrong, aye? Before we discuss the (embarrassing) fix, let's learn how I reproduced it.

## Checking the compatibility

We're in the moment when I had a project on which I was able to reproduce the issue. I had some clues about what may be wrong (dozens of clues!). I decided to automate it before providing the fix. Such automation is more complex. As you know now, it's not possible to ensure that the generated code by the TypeScript compiler is compatible with different module styles. The only way is to test it on the real project.

The test project I got was using [Nuxt.js](https://github.com/nuxt/nuxt). Nuxt.js is a framework built on Vue.js that offers server-side rendering, static site generation, and automatic code splitting to simplify Vue app development. It's chosen for its ease of use, SEO benefits, performance optimisation features, and ability to streamline project setup and deployment. 

It's actually not important that it uses this particular framework, but what it brings. As always, strong powers can also be weaknesses. The fact that it has built-in bundling and code splitting and allows using both the backend and front end in one place can cause more compatibility issues. Why?

When TypeScript code is bundled, tools like Webpack, Rollup, or Parcel take care of module resolution and dependencies and can transpile the code to ensure compatibility across different environments. These bundlers often smooth over discrepancies between module formats (e.g., CommonJS vs. ES Modules) and file extensions. However, when you work with unbundled TypeScript code in a project that uses ES Modules, several issues can arise, particularly related to module resolution, file extensions, and differences in syntax between TypeScript and native ES Modules in Node.js. 

Technically, the flow looks as follows
1. Npm package TypeScript code is transpilled into JavaScript, then minified, bundled and packaged.
2. Now, if you're using such a package, you need to load the proper JS code, find TypeScript type maps and import it into your application code. Then, if you're using TypeScript and frameworks like Nuxt, it'll be transpilled, minified, bundled, and packaged again.

It's like [Chinese Whispers game](https://en.wikipedia.org/wiki/Chinese_whispers). As in this game, the solution may not be what we expect.

The other challenge is that Nuxt wasn't failing during the build but when it was generating the static HTML files. That's the power of it: you can run the same code in the backend and browser, but it also adds more trouble. Especially that when running its built-in command:

```bash
npm run generate --fail-on-error
```

It wasn't failing. It silently succeeded in redirecting errors to [Standard Error Output (stderr)](https://bash.cyberciti.biz/guide/Standard_error). No one said that's going to be easy, but that's why we're here!

**I decided to take the following path for checking the compatibility:**
1. **Put the sample application with import error for ES Modules [into Emmett repository](https://github.com/event-driven-io/emmett/tree/1624935161f5db6f5f14461d007154da3dd75c00/e2e/esmCompatibility)**. This is important for the [Red, Green Refactor](https://martinfowler.com/bliki/TestDrivenDevelopment.html). Knowing that it fails, we get certain that it's fixed after the change.
2. **Extend the existing GitHub Action pipeline** that builds and tests all packages during each Pull Request and main branch commit.
3. **Extend it by building Emmett's npm package with _npm pack_.** This creates a [tarball](https://en.wikipedia.org/wiki/Tar_(computing)) of your package, simulating what would be uploaded to npm without actually publishing it. This step is crucial for testing the package as it would appear to consumers. I wouldn't like to publish the package only to realise that I broke compatibility. I needed to do it before that.
4. **Install such tarball file as a package reference in the sample application.** Npm allows doing that without additional steps to set up the package server or file share. The soundest way to validate integration and compatibility is to install the package in a sample project that uses ES Modules and attempts to import code from your package.
5. **Build the Sample Project and check if there are no errors now.**

That sounds simple, but how do you tackle it? Let's go through it step by step.

The first two steps are pretty straightforward. I copied the project as it is to ensure that I'm following the reproduction steps. I also had the initial pipeline. Let's go to the next steps

### Extend it by building Emmett's npm package with _npm pack_.

In Emmett, I'm using a mono repo based on the [NPM Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) to tame the complexity of building multiple packages. That's a topic on its own, so let's leave the details for another blog article. Most importantly, all packages are nested in the _packages_ folder, and npm has built-in ways to work only on specific packages. To pack a particular package (in this case, core Emmett package), you need to call:

```bash
npm pack -w @event-driven-io/emmett
```

The _-w_ parameter means we're running the command for specific workspaces. In this case, the core package workspace. The command will generate a tarball in the root folder. That's not perfect for our case, especially since it'll have the package version in its name, for instance: _event-driven-io-emmett-0.5.2.tgz_. That means it's not repeatable; when we change the version, it'll have a different one. 

**Luckily _npm pack_ have more options. We can specify the file destination and also return the result metadata in JSON format:**

```bash
npm pack --json --pack-destination './e2e/esmCompatibility' -w @event-driven-io/emmett
```

The _./e2e/esmCompatibility_ is the location of my sample project. 

Result JSON will contain all metadata about the generated package. We don't need all of them; we just want to extract the file name. We're running commands in GitHub actions, so Linux, why don't we use some of the native goodies like pipelining and tools like [jq](https://jqlang.github.io/jq/manual/)? _jq_ tool is a lightweight and flexible command-line JSON processor, enabling users to easily parse, filter, and transform JSON data. That's precisely what we need!

We can do:

```bash
npm pack --json --pack-destination './e2e/esmCompatibility' -w @event-driven-io/emmett | \
jq -r '.[] | .filename'
```

This will return the raw value of the _filename_ property of the object in the results array. Why do we need it? In the next step, we'll need to pass it to the _npm install_ command.

**We must export the filename to some GitHub Actions environment variable to make it available in a separate step of the GitHub Action pipeline.** GitHub action allows us to do that by:

```yml
- name: Pack Emmett locally to tar file
  shell: bash
  run: echo "PACKAGE_FILENAME=$(our bash script)" >> $GITHUB_ENV
```

So our whole step will look like:

```yml
- name: Pack Emmett locally to tar file
  shell: bash
  run: echo "PACKAGE_FILENAME=$(npm pack --json --pack-destination './e2e/esmCompatibility' -w @event-driven-io/emmett | jq -r '.[] | .filename')" >> $GITHUB_ENV
```

### Install such tarball file as a package reference in the sample application

This part is simple; our sample application already has the tarball file with packed library code. We have the filename in our environment variable. Let's use it:

```yml
- name: Use it in the compatibility test project
  working-directory: ./e2e/esmCompatibility
  run: npm install ${{ env.PACKAGE_FILENAME }}
```

Just to be sure that packages were refreshed, we can also run _npm install_:

```yml
- name: Install packages in the compatibility test project
  working-directory: ./e2e/esmCompatibility
  run: npm install
```

### Build the Sample Project and check if there are no errors now

To reproduce the issue, we need to try to build a sample project. As mentioned earlier, the challenge with this Nuxt setup is that Nuxt does not fail during the build but when it generates the static HTML files. It silently succeeded in redirecting errors to [Standard Error Output (stderr)](https://bash.cyberciti.biz/guide/Standard_error). The error lines will look as that:

```bash
Error:  [nuxt] [request error] [unhandled] [500] Directory import '/home/runner/work/emmett/emmett/e2e/esmCompatibility/node_modules/@event-driven-io/emmett/dist/commandHandling' is not supported resolving ES modules imported from /home/runner/work/emmett/emmett/e2e/esmCompatibility/node_modules/@event-driven-io/emmett/dist/index.mjs
Error:  [nuxt] [request error] [unhandled] [500] Directory import '/home/runner/work/emmett/emmett/e2e/esmCompatibility/node_modules/@event-driven-io/emmett/dist/commandHandling' is not supported resolving ES modules imported from /home/runner/work/emmett/emmett/e2e/esmCompatibility/node_modules/@event-driven-io/emmett/dist/index.mjs
```

So we'll need to do more lifting and parse the output. Again, Linux tools like [grep](https://man7.org/linux/man-pages/man1/grep.1.html) are pretty straightforward. As long as you know the syntax, which wasn't my precise case, I had to learn. The grep command searches through input text, filtering for lines that match a specified pattern, and outputs those lines. 

The challenge with grep is that we need to fail our script when matches are found, and grep doesn't do that. It returns found lines. Yet, we can deal with that with a simple if. Our shell script can look as follows:

```bash
if npm run generate 2>&1 | grep -iF '[request error]'; then
  echo "Errors found, failing the step." && exit 1
else
   echo "No errors found, proceeding..."
fi
```

The script runs npm run generate, and _2>&1_ error messages with the standard output to be scanned together. 2 stands for _stderr_ and 1 for _stdout_. This merging is crucial because it ensures no message is missed, whether it's an error or not. 

After merging, the script uses the pipeline operator _|_ to send this combined stream to _grep_, which looks for _"[request error]_. The _—F_ means it treats the search phrase as a fixed string, not a regexp pattern. The _-i_ param makes the search case-insensitive.

Finding this phrase triggers _"Errors found, failing the step."_ and stops the script with exit 1, indicating an error occurred. It is crucial to tell GitHub Actions that the step failed.

If the phrase isn't found, "No errors found, proceeding..." is printed, and the step succeeds.

### Complete pipeline

The complete pipeline with all the steps [looks as follows](https://github.com/event-driven-io/emmett/blob/231174185a23eb3d0a26ba52270ba7c4cc2312bb/.github/workflows/build_and_test.yml):

```yml
name: Build and test

on:
  # run it on push to the default repository branch
  push:
    branches: [main]
  # run it during pull request
  pull_request:

jobs:
  build-and-test-code:
    name: Build application code
    # use system defined below in the tests matrix
    runs-on: ${{ matrix.os }}

    strategy:
      # define the test matrix
      matrix:
        # selected operation systems to run CI
        os: [ubuntu-latest] #, windows-latest, macos-latest]
        # selected node version to run CI
        node-version: [20.11.1]

    steps:
      - name: Check Out Repo
        uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          # use the node version defined in matrix above
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build TS
        run: npm run build:ts

      - name: Run linting (ESlint and Prettier)
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Test
        run: npm run test

      - name: Pack Emmett locally to tar file
        shell: bash
        run: echo "PACKAGE_FILENAME=$(npm pack --json --pack-destination './e2e/esmCompatibility' -w @event-driven-io/emmett | jq -r '.[] | .filename')" >> $GITHUB_ENV

      - name: Use it in the compatibility test project
        working-directory: ./e2e/esmCompatibility
        run: npm install ${{ env.PACKAGE_FILENAME }}

      - name: Install packages in the compatibility test project
        working-directory: ./e2e/esmCompatibility
        run: npm install

      - name: Build the compatibility test project final
        working-directory: ./e2e/esmCompatibility
        shell: bash
        run: |
          if npm run generate 2>&1 | grep -iF '[request error]'; then
            echo "Errors found, failing the step." && exit 1
          else
            echo "No errors found, proceeding..."
          fi
```

### The Fix

Ok, reproduction steps are great, but what did I do to fix the issue? The Fix and source of failure were somewhat embarrassing (as always). 

**I'm using [tsup](https://github.com/egoist/tsup) to bundle and minimise my package code.** _tsup_ is known for its simplicity and efficiency. It focuses on producing minimal and fast JavaScript output. It automatically handles TypeScript compilation and has built-in support for tree shaking, which helps reduce the bundle size. It's a great and simple tool, but it can still fail in the hands of sloppy developers like me.

You configure it through the _tsup.config.ts_. My looked look like this:

```typescript
import { defineConfig } from 'tsup';

const env = process.env.NODE_ENV;

export default defineConfig({
  splitting: true,
  clean: true, // clean up the dist folder
  dts: true, // generate dts files
  format: ['cjs', 'esm'], // generate cjs and esm files
  minify: env === 'production',
  bundle: env === 'production',
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.ts'],
  watch: env === 'development',
  target: 'esnext',
  outDir: 'dist',
  entry: ['src/**/*.ts', '!src/**/*.spec.ts'], //include all files under src but not specs
  sourcemap: true,
  tsconfig: 'tsconfig.build.json', // workaround for https://github.com/egoist/tsup/issues/571#issuecomment-1760052931
});
```

Guess what I did wrong? 

Yup, I tried to be sneaky. And writing sneaky code is not the smartest move. I didn't set the env before publishing to _production_. Because of that, it wasn't bundling and minimising code, but leaving it nested.

When code is bundled, it's effectively placed in a single file (well, almost; it's chunked to allow asynchronous, gradual loading). Thanks to that, you don't get the issue of referencing the wrong files of the different module types. Depending on the tooling configuration, unbundled code may have issues locating the proper ES Modules or CommonJS files. With bundling, this problem disappears. So The Fix was just to change those two lines from:

```typescript
import { defineConfig } from 'tsup';

const env = process.env.NODE_ENV;

export default defineConfig({
  // (...)
  minify: env === 'production',
  bundle: env === 'production',
  // (...)
});
```

to

```typescript
import { defineConfig } from 'tsup';

const env = process.env.NODE_ENV;

export default defineConfig({
  // (...)
  minify: true,
  bundle: true,
  // (...)
});
```

Curtain!

### TLDR

Reflecting on this whirlwind journey of making Emmett compatible with ES Modules and CommonJS has been quite the ride. Delivering OSS packages is a decent opportunity to learn new stuff. But not always; you'd like to have such opportunities so often. Despite being a 2015 initiative, the move to ES Modules feels as fresh and ongoing as ever. It's like keeping pace with the never-ending updates in our favourite TV series.

**One may say that JS land is terrible, and what I did is too much of a heavy lifting. And one could be right. But even though I got the hard lesson, I see that as positive.** JS community is thriving. The diversity can sometimes be overwhelming, but at least you have a choice and tools to fix it. Having too big a choice is still better than monoculture and the single way. Especially if you have standards to which the community is moving.

Transitions are always hard, and compatibility is never easy. I hope this article explains how to deal with compatibility issues and harder-to-find bugs. It's essential to find a repeatable way to avoid regression and then make the fix. 

**The approach explained can also give you a general mental framework for tackling compatibility issues in other environments.**

Last but not least, go check [Emmett](https://event-driven-io.github.io/emmett/getting-started.html). It'll take your event-driven applications back to the future.

**[Join also our Discord](https://discord.gg/fTpqUTMmVa) to get a live stream of fun like this!**

See also the PRs with fixes:
- https://github.com/event-driven-io/emmett/pull/39
- https://github.com/event-driven-io/emmett/pull/41
- https://github.com/event-driven-io/emmett/pull/42

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
