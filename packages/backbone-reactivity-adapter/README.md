
# Backbone Reactivity Adapter
A tool use to convert Backbone Models to POJOs while performing large scale backbone migrations. Let's face it, 
writing backbone in the modern age of JavaScript is not fun. But large scale migrations do not need to be hopeless!
For global state objects for large scale applications, we can utilize ES6 proxies under the hood to adapt to a different type
of Model, such as a Plain Old Javascript Object. This allows migrations in large scale applications to be performed over time, without
sacrificing the performance of your application.

The Backbone Reactivity Adapter uses factory functions to build the adaptive models from Backbone -> POJO. In this repository, JSON:API factories are used
to parse raw JSON:API responses to the adaptive models. These structures are synced under to each other, and can be shared in cache.

To keep these items in cache, a WeakMap is used under the hood to store the root object. 
Along with this object, the Backbone Model that proxies to this object and the POJO model are also stored in the weakmap.
When the root object is no longer referenced in memory, the values are cleaned up out of the WeakMap to avoid memory leaks.

##### build all subsequent packages
```
npm run build 
```
##### test all subsequent packages
```
npm run test 
```