# templater-scripts-types
Type definitions for creating user scripts

This is intended to assist with creating user scripts with the templater plugin by proving typescript like functionality in your javascript files.

# How to use
1. Clone the repository to wherever
2. Copy the .dev folder and tsconfig.json file into whichever folder you have defined as your templater scripts folder.
3. (optional) If you use obsidian git, consider adding "\*\*/.dev/\*\*" and "\*\*/tsconfig.json" to your .gitignore file.
4. Create all your user scripts with the below templates:
5. If you are using the moment interface, uncomment line 1 for types and autocomplete.
6. Re-comment line 1 else templater will throw an error on trying to execute the script file

This gives the correct suggestions to all templater functions with full jsdocs as per the plugin functions.

# Templates

### Templater
Internal function call:
```javascript
tp.user.userFunction(tp)
```
Script:
```javascript
//import moment from '.dev/types/moment'; 

/**
 * 
 * @param {import('templater-obsidian').TemplaterApi} tp
 */
function userFunction (tp) {
    
}

module.exports = userFunction;
```

### Templater + Dataview
Internal function call:
```
tp.user.userFunction(tp, this.app.plugins.plugins["dataview"].api)
```
Script:
```javascript
//import moment from '.dev/types/moment'; 

/**
 * 
 * @param {import('templater-obsidian').TemplaterApi} tp
 * @param {import('api/inline-api').DataviewInlineApi} dv
 * 
 */
function userFunction (tp, dv) {
    
}

module.exports = userFunction;
```

# References

Information for jsdocs was replicated from [Templater Docs](https://silentvoid13.github.io/Templater)

moment.d.ts types file copied from [https://github.com/moment/moment](https://github.com/moment/moment)

obsidian types cloned from [https://github.com/obsidianmd/obsidian-api](https://github.com/obsidianmd/obsidian-api)

dataview.d.ts types cloned from gist by airtonix [https://gist.github.com/airtonix/5deec296bad0227ffc24be588b2da18a](https://gist.github.com/airtonix/5deec296bad0227ffc24be588b2da18a)
