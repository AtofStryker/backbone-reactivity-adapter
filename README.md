
# Backbone Reactivity Adapter
A tool use to convert Backbone Models to POJOs while performing large scale backbone migrations. Let's face it, 
writing backbone in the modern age of JavaScript is not fun. But large scale migrations do not need to be hopeless!
For global state objects for large scale applications, we can utilize ES6 proxies under the hood to adapt to a different type
of Model, such as a Plain Old Javascript Object. This allows migrations in large scale applications to be performed over time, without
sacrificing the performance of your application.

The Backbone Reactivity Adapter uses factory functions to build the adaptive models from Backbone -> POJO. In this repository, JSON:API factories are used
to parse raw JSON:API responses to the adaptive models. These structures are synced under to each other, and can be shared in cache.

Currently, the following packages are available for consumption

* backbone-model-factory-json-api
* pojo-model-factory-json-api
* backbone-reactivity-adapter


### Getting Started


#### Prerequisites
```
node >= 12.13.0
npm i -g link-parent-bin
npm i -g lerna
npm i -g typescript
```

#### Depending on your setup, you may need to install `jest` as your test runner
```
npm i -g jest
```

##### install - will link all local dependencies and hoist all install dependencies
```
npm install
```

##### build all subsequent packages
```
npm run build 
```
##### test all subsequent packages
```
npm run test 
```
##### cleaning stale dependencies

```
npm run clean 
```

##### cleaning  stale builds
```
npm run cleanBuilds
```