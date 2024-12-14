let replacements = {};
let dumpedVarNames = {};
const storeName = "a" + crypto.randomUUID().replaceAll("-", "").substring(16);
const vapeName = crypto.randomUUID().replaceAll("-", "").substring(16);

// ANTICHEAT HOOK
function replaceAndCopyFunction(oldFunc, newFunc) {
    return new Proxy(oldFunc, {
        apply(orig, origIden, origArgs) {
            const result = orig.apply(origIden, origArgs);
            newFunc(result);
            return result;
        },
        get(orig) { return orig; }
    });
}

Object.getOwnPropertyNames = replaceAndCopyFunction(Object.getOwnPropertyNames, function(list) {
    if (list.indexOf(storeName) !== -1) list.splice(list.indexOf(storeName), 1);
    return list;
});

Object.getOwnPropertyDescriptors = replaceAndCopyFunction(Object.getOwnPropertyDescriptors, function(list) {
    delete list[storeName];
    return list;
});

function addReplacement(replacement, code, replaceit) {
    replacements[replacement] = [code, replaceit];
}

function addDump(replacement, code) {
    dumpedVarNames[replacement] = code;
}

function modifyCode(text) {
    for (const [name, regex] of Object.entries(dumpedVarNames)) {
        const matched = text.match(regex);
        if (matched) {
            console.log(name, regex, matched);
            for (const [replacement, code] of Object.entries(replacements)) {
                delete replacements[replacement];
                replacements[replacement.replaceAll(name, matched[1])] = [code[0].replaceAll(name, matched[1]), code[1]];
            }
        }
    }

    for (const [replacement, code] of Object.entries(replacements)) {
        text = text.replaceAll(replacement, code[1] ? code[0] : replacement + code[0]);
    }

    const newScript = document.createElement("script");
    newScript.type = "module";
    newScript.crossOrigin = "";
    newScript.textContent = text;
    const head = document.querySelector("head");
    head.appendChild(newScript);
    newScript.textContent = "";
    newScript.remove();
}

(function() {
    'use strict';

    // DUMPING
    addDump('moveStrafeDump', 'strafe:this\\.([a-zA-Z]*)');
    addDump('moveForwardDump', 'forward:this\\.([a-zA-Z]*)');
    // ... (other dumping code)

    // PRE
    addReplacement('document.addEventListener("DOMContentLoaded",startGame,!1);', `
        setTimeout(function() {
            var DOMContentLoaded_event = document.createEvent("Event");
            DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
            document.dispatchEvent(DOMContentLoaded_event);
        }, 0);
    `);

    // ... (other replacement and modification code)

    // MAIN
    const publicUrl = "scripturl";
    if (publicUrl === "scripturl") {
        if (navigator.userAgent.indexOf("Firefox") !== -1) {
            window.addEventListener("beforescriptexecute", function(e) {
                if (e.target.src.includes("https://miniblox.io/assets/index")) {
                    e.preventDefault();
                    e.stopPropagation();
                    execute(e.target.src);
                }
            }, false);
        } else {
            new MutationObserver(async (mutations, observer) => {
                let oldScript = mutations
                    .flatMap(e => [...e.addedNodes])
                    .filter(e => e.tagName === 'SCRIPT')
                    .find(e => e.src.includes("https://miniblox.io/assets/index"));

                if (oldScript) {
                    observer.disconnect();
                    oldScript.remove(); // Remove the old script
                    execute(oldScript.src, oldScript);
                }
            }).observe(document, {
                childList: true,
                subtree: true,
            });
        }
    } else {
        execute(publicUrl);
    }
})();

async function execute(src, oldScript) {
    try {
        if (oldScript) oldScript.remove(); // Remove the old script
        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.text();
        const script = new Function(data.replace("scripturl", src)); // Safer than eval
        script();
    } catch (error) {
        console.error("Failed to fetch or execute script:", error);
    }
}
