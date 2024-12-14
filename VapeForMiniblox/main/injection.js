let replacements = {};
let dumpedVarNames = {};
const storeName = "a" + crypto.randomUUID().replaceAll("-", "").substring(16);
const vapeName = "b" + crypto.randomUUID().replaceAll("-", "").substring(16);

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
    addDump('keyPressedDump', 'function ([a-zA-Z]*)\$j\$\\{return keyPressed\$j\$');
    addDump('entitiesDump', 'this\\.([a-zA-Z]*)\\.\values\$\$\$nt instanceof EntityTNTPrimed');
    addDump('isInvisibleDump', 'ot\\.([a-zA-Z]*)\$\$\$&&\$pt=new ([a-zA-Z]*)\$new');
    addDump('attackDump', 'hitVec\z\}\$\$\$,player\\$1\\.([a-zA-Z]*)');
    addDump('lastReportedYawDump', 'this\\.([a-zA-Z]*)=this\\.yaw,this\\.last');
    addDump('windowClickDump', '([a-zA-Z]*)\$this\\.inventorySlots\\.windowId');
    addDump('playerControllerDump', 'const ([a-zA-Z]*)=new PlayerController,');
    addDump('damageReduceAmountDump', 'ItemArmor&&\$tt\\+\\=it\\.([a-zA-Z]*)');
    addDump('boxGeometryDump', 'ot=new Mesh\$new ([a-zA-Z]*)\$1');
    addDump('syncItemDump', 'playerControllerMP\\.([a-zA-Z]*)\$\$,ClientSocket\\.sendPacket');

    // PRE
    addReplacement('document.addEventListener("DOMContentLoaded",startGame,!1);', `
        setTimeout(function() {
            var DOMContentLoaded_event = document.createEvent("Event");
            DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
            document.dispatchEvent(DOMContentLoaded_event);
        }, 0);
    `);

    addReplacement('Potions.jump.getId(),"5");', `
        let blocking = false;
        let sendYaw = false;
        let breakStart = Date.now();
        let noMove = Date.now();

        let enabledModules = {};
        let modules = {};

        let keybindCallbacks = {};
        let keybindList = {};

        let tickLoop = {};
        let renderTickLoop = {};

        let lastJoined, velocityhori, velocityvert, chatdisablermsg, textguifont, textguisize, textguishadow, attackedEntity, stepheight;
        let attackTime = Date.now();
        let chatDelay = Date.now();

        function getModule(str) {
            for(const [name, module] of Object.entries(modules)) {
                if (name.toLocaleLowerCase() == str.toLocaleLowerCase()) return module;
            }
        }

        let j;
        for (j = 0; j < 26; j++) keybindList[j + 65] = keybindList["Key" + String.fromCharCode(j + 65)] = String.fromCharCode(j + 97);
        for (j = 0; j < 10; j++) keybindList[48 + j] = keybindList["Digit" + j] = "" + j;
        window.addEventListener("keydown", function(key) {
            const func = keybindCallbacks[keybindList[key.code]];
            call\$1(func, key);
        });
    `);

    addReplacement('VERSION\$1," | ",', `"${vapeName} v1.0.5"," | ",`);
    addReplacement('if(!nt.canConnect){', 'nt.errorMessage = nt.errorMessage == "Could not join server. You are connected to a VPN or proxy. Please disconnect from it and refresh the page." ? "You\'re either using a detected VPN server or IP banned for cheating." : nt.errorMessage;');

    // Drawing setup
    addReplacement('ut(this,"glintTexture");', `
        ut(this, "vapeTexture");
        ut(this, "v4Texture");
    `);
    addReplacement('skinManager.loadTextures(),', ',this.loadVape(),');
    addReplacement('async loadSpritesheet(){', `
        async loadVape() {
            this.vapeTexture = await this.loader.loadAsync("https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/assets/logo.png");
            this.v4Texture = await this.loader.loadAsync("https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/assets/logov4.png");
        }
        async loadSpritesheet(){
    `, true);

    // Teleport fix
    addReplacement('player\$1.setPositionAndRotation($.x,$.y,$.z,$.yaw,$.pitch),', `
        noMove = Date.now() + 500;
        player\$1.setPositionAndRotation($.x,$.y,$.z,$.yaw,$.pitch),
    `, true);

    addReplacement('COLOR_TOOLTIP_BG,BORDER_SIZE)}', `
        function drawImage(ctx, img, posX, posY, sizeX, sizeY, color) {
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(posX, posY, sizeX, sizeY);
                ctx.globalCompositeOperation = "destination-in";
            }
            ctx.drawImage(img, posX, posY, sizeX, sizeY);
            if (color) ctx.globalCompositeOperation = "source-over";
        }
    `);

    // Text GUI
    addReplacement('(this.drawSelectedItemStack(),this.drawHintBox())', `
        if (ctx$3 && enabledModules["TextGUI"]) {
            const colorOffset = (Date.now() / 4000);
            const posX = 15;
            const posY = 17;
            ctx$3.imageSmoothingEnabled = true;
            ctx$3.imageSmoothingQuality = "high";
            drawImage(ctx\$3, textureManager.vapeTexture.image, posX, posY, 80, 21, \`HSL(\${(colorOffset % 1) * 360}, 100%, 50%)\`);
            drawImage(ctx$3, textureManager.v4Texture.image, posX + 81, posY + 1, 33, 18);

            let offset = 0;
            let stringList = [];
            for(const [module, value] of Object.entries(enabledModules)) {
                if (!value || module == "TextGUI") continue;
                stringList.push(module);
            }

            stringList.sort(function(a, b) {
                const compA = ctx$3.measureText(a).width;
                const compB = ctx$3.measureText(b).width;
                return compA < compB ? 1 : -1;
            });

            for(const module of stringList) {
                offset++;
                drawText(ctx$3, module, posX + 6, posY + 12 + ((textguisize[1] + 3) * offset), textguisize[1] + "px " + textguifont[1], \`HSL(\${((colorOffset - (0.025 * offset)) % 1) * 360}, 100%, 50%)\`, "left", "top", 1, textguishadow[1]);
            }
        }
    `);

    // Hooks
    addReplacement('+=$*rt+_*nt}', `
        if (this == player\$1) {
            for(const [index, func] of Object.entries(tickLoop)) if (func) func();
        }
    `);
    addReplacement('this.game.unleash.isEnabled("disable-ads")', 'true', true);
    addReplacement('$.render()})', '; for(const [index, func] of Object.entries(renderTickLoop)) if (func) func();');
    addReplacement('updateNameTag(){let$="white",et = 1;', 'this.entity.team = this.entity.profile.cosmetics.color;');
    addReplacement('connect(_,$=!1,et=!1){', 'lastJoined = _;');
    addReplacement('SliderOption("Render Distance ",2,8,3)', 'SliderOption("Render Distance ",2,64,3)', true);
    addReplacement('ClientSocket.on("CPacketDisconnect",$=>{', `
        if (enabledModules["AutoRejoin"]) {
            setTimeout(function() {
                j.connect(lastJoined);
            }, 400);
        }
    `);
    addReplacement('ClientSocket.on("CPacketMessage",$=>{', `
        if (player\$1 && $.text && !$.text.startsWith(player$1.name) && enabledModules["ChatDisabler"] && chatDelay < Date.now()) {
            chatDelay = Date.now() + 1000;
            setTimeout(function() {
                ClientSocket.sendPacket(new SPack 
addReplacement('ClientSocket.on("CPacketMessage",$=>{', `
    if (player\$1 && $.text && !$.text.startsWith(player$1.name) && enabledModules["ChatDisabler"] && chatDelay < Date.now()) {
        chatDelay = Date.now() + 1000;
        setTimeout(function() {
            ClientSocket.sendPacket(new SPacketChatMessage(chatdisablermsg || "Chat is disabled by Vape V4."));
        }, 100);
        return;
    }
    if (player\$1 && $.text && $.text.startsWith(player$1.name) && enabledModules["ChatHighlight"] && chatDelay < Date.now()) {
        chatDelay = Date.now() + 1000;
        const highlightColor = enabledModules["ChatHighlight"];
        const msg = $.text.replace(new RegExp(player$1.name, 'g'), `<span style="color:${highlightColor};">${player$1.name}</span>`);
        setTimeout(function() {
            ClientSocket.sendPacket(new SPacketChatMessage(msg));
        }, 100);
        return;
    }
    if (player\$1 && $.text && enabledModules["ChatTimestamp"]) {
        const timestampColor = enabledModules["ChatTimestamp"];
        const msg = `<span style="color:${timestampColor};">[${new Date().toLocaleTimeString()}]</span> ${$.text}`;
        setTimeout(function() {
            ClientSocket.sendPacket(new SPacketChatMessage(msg));
        }, 100);
        return;
    }
    $==null||ClientSocket.sendPacket(new SPacketChatMessage($.text));
`);

addReplacement('ClientSocket.on("CPacketJoinGame",$=>{', `
    if (enabledModules["AutoRespawn"]) {
        setTimeout(function() {
            player\$1.respawn();
        }, 1000);
    }
    $==null||ClientSocket.sendPacket(new SPacketJoinGame($));
`);

addReplacement('ClientSocket.on("CPacketPlayerPositionAndRotation",$=>{', `
    if (enabledModules["RotationFix"]) {
        $.yaw = player\$1.yaw;
        $.pitch = player\$1.pitch;
    }
    if (enabledModules["AntiKick"] && noMove > Date.now()) {
        return;
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerPositionAndRotation($.x,$.y,$.z,$.yaw,$.pitch));
`);

addReplacement('ClientSocket.on("CPacketUseEntity",$=>{', `
    if (enabledModules["KillAura"]) {
        attackedEntity = $.entityId;
        if (Date.now() - attackTime > 500) {
            attackTime = Date.now();
            const entity = player\$1.world.getEntityById($.entityId);
            if (entity && entity.team != player\$1.team) {
                player\$1.attack(entity);
            }
        }
    }
    $==null||ClientSocket.sendPacket(new SPacketUseEntity($.entityId,$.action));
`);

addReplacement('ClientSocket.on("CPacketAnimation",$=>{', `
    if (enabledModules["FastBreak"]) {
        if (Date.now() - breakStart > 50) {
            breakStart = Date.now();
            player\$1.breakBlock();
        }
    }
    $==null||ClientSocket.sendPacket(new SPacketAnimation($.entityId,$.action));
`);

addReplacement('ClientSocket.on("CPacketKeepAlive",$=>{', `
    if (enabledModules["AntiKick"]) {
        return;
    }
    $==null||ClientSocket.sendPacket(new SPacketKeepAlive($.id));
`);

addReplacement('ClientSocket.on("CPacketPlayerMovement",$=>{', `
    if (enabledModules["NoSlow"] && blocking) {
        $.forward *= 0.2;
        $.strafe *= 0.2;
    }
    if (enabledModules["AntiKick"] && noMove > Date.now()) {
        $.forward = $.strafe = 0;
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerMovement($.forward,$.strafe));
`);

addReplacement('ClientSocket.on("CPacketPlayerAction",$=>{', `
    if (enabledModules["FastBreak"] && $.action == "START_BREAK") {
        breakStart = Date.now();
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerAction($.action,$.x,$.y,$.z,$.face));
`);

addReplacement('ClientSocket.on("CPacketPlayerAbilities",$=>{', `
    if (enabledModules["InfiniteJump"]) {
        $.jumpAllowed = true;
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerAbilities($.invulnerable,$.flying,$.allowedToFly,$.creativeMode,$.flySpeed,$.walkSpeed));
`);

addReplacement('ClientSocket.on("CPacketPlayerDigging",$=>{', `
    if (enabledModules["FastBreak"]) {
        breakStart = Date.now();
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerDigging($.status,$.x,$.y,$.z,$.face));
`);

addReplacement('ClientSocket.on("CPacketPlayerInteractEntity",$=>{', `
    if (enabledModules["AutoEat"] && player$1.getHeldItem().type == ItemType.FOOD) {
        player\$1.eatHeldItem();
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerInteractEntity($.entityId,$.action));
`);

addReplacement('ClientSocket.on("CPacketPlayerTryUseItem",$=>{', `
    if (enabledModules["AutoEat"] && player$1.getHeldItem().type == ItemType.FOOD) {
        player\$1.eatHeldItem();
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerTryUseItem($.hand));
`);

addReplacement('ClientSocket.on("CPacketPlayerTryUseItemOnBlock",$=>{', `
    if (enabledModules["AutoEat"] && player$1.getHeldItem().type == ItemType.FOOD) {
        player\$1.eatHeldItem();
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerTryUseItemOnBlock($.x,$.y,$.z,$.face,$.hand));
`);

addReplacement('ClientSocket.on("CPacketPlayerInventoryChange",$=>{', `
    if (enabledModules["AutoArmor"] && player\$1.inventory.getItem($.slot).type.includes("Armor")) {
        player\$1.equipArmor($.slot);
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerInventoryChange($.slot,$.item));
`);

addReplacement('ClientSocket.on("CPacketWindowClick",$=>{', `
    if (enabledModules["AutoArmor"] && player\$1.inventory.getItem($.slot).type.includes("Armor")) {
        player\$1.equipArmor($.slot);
    }
    $==null||ClientSocket.sendPacket(new SPacketWindowClick($.windowId,$.slot,$.button,$.action,$.item));
`);

addReplacement('ClientSocket.on("CPacketCloseWindow",$=>{', `
    $==null||ClientSocket.sendPacket(new SPacketCloseWindow($.windowId));
`);

addReplacement('ClientSocket.on("CPacketPlayerBlockPlacement",$=>{', `
    if (enabledModules["FastPlace"]) {
        player\$1.placeBlock($.x,$.y,$.z,$.face);
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerBlockPlacement($.x,$.y,$.z,$.face,$.hand,$.cursorX,$.cursorY,$.cursorZ));
`);

addReplacement('ClientSocket.on("CPacketHeldItemChange",$=>{', `
    if (enabledModules["AutoArmor"] && player\$1.inventory.getItem($.slot).type.includes("Armor")) {
        player\$1.equipArmor($.slot);
    }
    $==null||ClientSocket.sendPacket(new SPacketHeldItemChange($.slot));
`);

addReplacement('ClientSocket.on("CPacketEntityAction",$=>{', `
    if (enabledModules["Sprint"] && $.action == "START_SPRINTING") {
        player\$1.setSprinting(true);
    } else if (enabledModules["Sprint"] && $.action == "STOP_SPRINTING") {
        player\$1.setSprinting(false);
    } else if (enabledModules["Sneak"] && $.action == "START_SNEAKING") {
        player\$1.setSneaking(true);
    } else if (enabledModules["Sneak"] && $.action == "STOP_SNEAKING") {
        player\$1.setSneaking(false);
    }
    $==null||ClientSocket.sendPacket(new SPacketEntityAction($.entityId,$.action,$.jumpBoost));
`);

addReplacement('ClientSocket.on("CPacketPlayerInput",$=>{', `
    if (enabledModules["NoSlow"] && blocking) {
        $.forward *= 0.2;
        $.strafe *= 0.2;
    }
    if (enabledModules["InfiniteJump"] && player\$1.abilities.jumpAllowed && $.jump) {
        player\$1.jump();
    }
    $==null||ClientSocket.sendPacket(new SPacketPlayerInput($.forward,$.strafe,$.jump,$.sneaking));
`);

modifyCode(await (await fetch("scripturl")).text());

const publicUrl = "https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/injection.js";

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
async function saveVapeConfig(profile) {
    if (!loadedConfig) return;
    let saveList = {};
    for(const [name, module] of Object.entries(unsafeWindow.globalThis[storeName].modules)) {
        saveList[name] = {enabled: module.enabled, bind: module.bind, options: {}};
        for(const [option, setting] of Object.entries(module.options)) {
            saveList[name].options[option] = setting[1];
        }
    }
    GM_setValue("vapeConfig" + (profile ?? unsafeWindow.globalThis[storeName].profile), JSON.stringify(saveList));
    GM_setValue("mainVapeConfig", JSON.stringify({profile: unsafeWindow.globalThis[storeName].profile}));
}

async function loadVapeConfig(switched) {
    loadedConfig = false;
    const loadedMain = JSON.parse(await GM_getValue("mainVapeConfig", "{}")) ?? {profile: "default"};
    unsafeWindow.globalThis[storeName].profile = switched ?? loadedMain.profile;
    const loaded = JSON.parse(await GM_getValue("vapeConfig" + unsafeWindow.globalThis[storeName].profile, "{}"));
    if (!loaded) {
        loadedConfig = true;
        return;
    }

    for(const [name, module] of Object.entries(loaded)) {
        const realModule = unsafeWindow.globalThis[storeName].modules[name];
        if (!realModule) continue;
        if (realModule.enabled !== module.enabled) realModule.toggle();
        if (realModule.bind !== module.bind) realModule.setbind(module.bind);
        if (module.options) {
            for(const [option, setting] of Object.entries(module.options)) {
                const realOption = realModule.options[option];
                if (!realOption) continue;
                realOption[1] = setting;
            }
        }
    }
    loadedConfig = true;
}

async function exportVapeConfig() {
    navigator.clipboard.writeText(await GM_getValue("vapeConfig" + unsafeWindow.globalThis[storeName].profile, "{}"));
}

async function importVapeConfig() {
    const arg = await navigator.clipboard.readText();
    if (!arg) return;
    GM_setValue("vapeConfig" + unsafeWindow.globalThis[storeName].profile, arg);
    loadVapeConfig();
}

let loadedConfig = false;
async function execute(src, oldScript) {
    Object.defineProperty(unsafeWindow.globalThis, storeName, {value: {}, enumerable: false});
    if (oldScript) oldScript.type = 'javascript/blocked';
    await fetch(src).then(e => e.text()).then(e => modifyCode(e));
    if (oldScript) oldScript.type = 'module';
    await new Promise((resolve) => {
        const loop = setInterval(async function() {
            if (unsafeWindow.globalThis[storeName].modules) {
                clearInterval(loop);
                resolve();
            }
        }, 10);
    });
    unsafeWindow.globalThis[storeName].saveVapeConfig = saveVapeConfig;
    unsafeWindow.globalThis[storeName].loadVapeConfig = loadVapeConfig;
    unsafeWindow.globalThis[storeName].exportVapeConfig = exportVapeConfig;
    unsafeWindow.globalThis[storeName].importVapeConfig = importVapeConfig;
    loadVapeConfig();
    setInterval(async function() {
        saveVapeConfig();
    }, 10000);
}

execute("https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/injection.js");
let modules = {
    "FastPlace": {
        enabled: true,
        bind: "KeyP",
        options: {
            "Delay": [0, 0, 500, 1]
        }
    },
    "FastBreak": {
        enabled: true,
        bind: "KeyO",
        options: {
            "Delay": [0, 0, 100, 1]
        }
    },
    "NoSlow": {
        enabled: true,
        bind: "KeyI",
        options: {}
    },
    "InfiniteJump": {
        enabled: true,
        bind: "Space",
        options: {}
    },
    "Sprint": {
        enabled: true,
        bind: "KeyL",
        options: {}
    },
    "Sneak": {
        enabled: true,
        bind: "ControlLeft",
        options: {}
    },
    "KillAura": {
        enabled: true,
        bind: "KeyK",
        options: {
            "Range": [4, 1, 6, 1],
            "Delay": [500, 0, 2000, 1]
        }
    },
    "AutoEat": {
        enabled: true,
        bind: "KeyJ",
        options: {}
    },
    "AutoArmor": {
        enabled: true,
        bind: "KeyH",
        options: {}
    },
    "AutoRespawn": {
        enabled: true,
        bind: "KeyG",
        options: {}
    },
    "RotationFix": {
        enabled: true,
        bind: "KeyF",
        options: {}
    },
    "AntiKick": {
        enabled: true,
        bind: "KeyE",
        options: {}
    },
    "ChatDisabler": {
        enabled: true,
        bind: "KeyD",
        options: {
            "Message": "Chat is disabled by Vape V4."
        }
    },
    "ChatHighlight": {
        enabled: true,
        bind: "KeyC",
        options: {
            "Color": "#00FF00"
        }
    },
    "ChatTimestamp": {
        enabled: true,
        bind: "KeyB",
        options: {
            "Color": "#CCCCCC"
        }
    },
    "TextGUI": {
        enabled: true,
        bind: "KeyA",
        options: {
            "Font": ["Arial", "Arial"],
            "Size": [16, 16],
            "Shadow": [true, true]
        }
    },
    "AutoRejoin": {
        enabled: true,
        bind: "KeyT",
        options: {}
    }
};

unsafeWindow.globalThis[storeName] = {
    modules: modules,
    profile: "default",
    saveVapeConfig,
    loadVapeConfig,
    exportVapeConfig,
    importVapeConfig
};

function getModule(str) {
    for(const [name, module] of Object.entries(unsafeWindow.globalThis[storeName].modules)) {
        if (name.toLocaleLowerCase() == str.toLocaleLowerCase()) return module;
    }
}

function call$1(func, ...args) {
    if (typeof func === 'function') {
        func.apply(null, args);
    }
}

for(const [name, module] of Object.entries(modules)) {
    Object.defineProperty(unsafeWindow.globalThis[storeName], name, {
        get: () => module,
        enumerable: true
    });
}

let keybindCallbacks = {};
let keybindList = {};

for (let j = 0; j < 26; j++) {
    keybindList[j + 65] = keybindList["Key" + String.fromCharCode(j + 65)] = String.fromCharCode(j + 97);
}
for (let j = 0; j < 10; j++) {
    keybindList[48 + j] = keybindList["Digit" + j] = "" + j;
}

window.addEventListener("keydown", function(key) {
    const func = keybindCallbacks[keybindList[key.code]];
    call$1(func, key);
});

function toggleModule(module) {
    if (typeof module === 'string') {
        module = getModule(module);
    }
    if (!module) return;
    module.toggle();
}

function setModuleBinding(module, bind) {
    if (typeof module === 'string') {
        module = getModule(module);
    }
    if (!module) return;
    module.setbind(bind);
}

function setModuleOption(module, option, value) {
    if (typeof module === 'string') {
        module = getModule(module);
    }
    if (!module) return;
    const realOption = module.options[option];
    if (!realOption) return;
    realOption[1] = value;
}

let enabledModules = {};
for (const [name, module] of Object.entries(modules)) {
    keybindCallbacks[module.bind] = () => toggleModule(name);
    enabledModules[name] = module.enabled;
}

let tickLoop = {};
let renderTickLoop = {};

let lastJoined, velocityhori, velocityvert, chatdisablermsg, textguifont, textguisize, textguishadow, attackedEntity, stepheight;
let attackTime = Date.now();
let chatDelay = Date.now();

let blocking = false;
let sendYaw = false;
let breakStart = Date.now();
let noMove = Date.now();

function drawText(ctx, text, x, y, font, color, align, baseline, alpha = 1, shadow = false) {
    if (shadow) {
        ctx.fillStyle = "black";
        ctx.globalAlpha = alpha * 0.5;
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x + 1, y + 1);
        ctx.globalAlpha = alpha;
    }
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
}

function drawImage(ctx, img, posX, posY, sizeX, sizeY, color) {
    if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(posX, posY, sizeX, sizeY);
        ctx.globalCompositeOperation = "destination-in";
    }
    ctx.drawImage(img, posX, posY, sizeX, sizeY);
    if (color) ctx.globalCompositeOperation = "source-over";
}

const textureManager = {
    vapeTexture: null,
    v4Texture: null
};

async function loadVape() {
    textureManager.vapeTexture = await this.loader.loadAsync("https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/assets/logo.png");
    textureManager.v4Texture = await this.loader.loadAsync("https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/assets/logov4.png");
}

async function loadSpritesheet() {
    await loadVape();
    this.loadTextures();
}

const originalFunctions = {
    getOwnPropertyNames: Object.getOwnPropertyNames,
    getOwnPropertyDescriptors: Object.getOwnPropertyDescriptors
};

Object.getOwnPropertyNames = replaceAndCopyFunction(Object.getOwnPropertyNames, function(list) {
    if (list.indexOf(storeName) !== -1) list.splice(list.indexOf(storeName), 1);
    return list;
});

Object.getOwnPropertyDescriptors = replaceAndCopyFunction(Object.getOwnPropertyDescriptors, function(list) {
    delete list[storeName];
    return list;
});

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

(async () => {
    const publicUrl = "https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/injection.js";
    await execute(publicUrl);
})();
function onRenderTick() {
    const ctx$3 = textureManager.vapeTexture?.image.getContext("2d");
    if (ctx$3 && enabledModules["TextGUI"]) {
        const colorOffset = (Date.now() / 4000);
        const posX = 15;
        const posY = 17;
        ctx$3.imageSmoothingEnabled = true;
        ctx$3.imageSmoothingQuality = "high";
        drawImage(ctx\$3, textureManager.vapeTexture.image, posX, posY, 80, 21, `HSL(${(colorOffset % 1) * 360}, 100%, 50%)`);
        drawImage(ctx$3, textureManager.v4Texture.image, posX + 81, posY + 1, 33, 18);

        let offset = 0;
        let stringList = [];
        for(const [module, value] of Object.entries(enabledModules)) {
            if (!value || module == "TextGUI") continue;
            stringList.push(module);
        }

        stringList.sort(function(a, b) {
            const compA = ctx$3.measureText(a).width;
            const compB = ctx$3.measureText(b).width;
            return compA < compB ? 1 : -1;
        });

        for(const module of stringList) {
            offset++;
            drawText(ctx$3, module, posX + 6, posY + 12 + ((textguisize[1] + 3) * offset), textguisize[1] + "px " + textguifont[1], `HSL(${((colorOffset - (0.025 * offset)) % 1) * 360}, 100%, 50%)`, "left", "top", 1, textguishadow[1]);
        }
    }
}

function onTick() {
    if (player$1) {
        for(const [index, func] of Object.entries(tickLoop)) {
            if (func) func();
        }
    }
}

function onRender() {
    for(const [index, func] of Object.entries(renderTickLoop)) {
        if (func) func();
    }
}

let renderTickLoopId = setInterval(onRender, 1000 / 60);
let tickLoopId = setInterval(onTick, 50);

const originalRender = this.render;
this.render = function() {
    originalRender.call(this);
    onRender();
};

const originalTick = this.tick;
this.tick = function() {
    originalTick.call(this);
    onTick();
};

const originalWindowClick = this.windowClick;
this.windowClick = function(...args) {
    originalWindowClick.call(this, ...args);
    onWindowClick(...args);
};

function onWindowClick(...args) {
    if (enabledModules["AutoArmor"] && player\$1.inventory.getItem(args[1]).type.includes("Armor")) {
        player$1.equipArmor(args[1]);
    }
}

const originalEntityDamage = this.entityDamage;
this.entityDamage = function(...args) {
    originalEntityDamage.call(this, ...args);
    onEntityDamage(...args);
};

function onEntityDamage(...args) {
    if (enabledModules["KillAura"] && args[0] == attackedEntity) {
        attackTime = Date.now();
    }
}

const originalPlayerInventoryChange = this.playerInventoryChange;
this.playerInventoryChange = function(...args) {
    originalPlayerInventoryChange.call(this, ...args);
    onPlayerInventoryChange(...args);
};

function onPlayerInventoryChange(...args) {
    if (enabledModules["AutoArmor"] && player\$1.inventory.getItem(args[0]).type.includes("Armor")) {
        player$1.equipArmor(args[0]);
    }
}

const originalHeldItemChange = this.heldItemChange;
this.heldItemChange = function(...args) {
    originalHeldItemChange.call(this, ...args);
    onHeldItemChange(...args);
};

function onHeldItemChange(...args) {
    if (enabledModules["AutoArmor"] && player\$1.inventory.getItem(args[0]).type.includes("Armor")) {
        player$1.equipArmor(args[0]);
    }
}

const originalPlayerDigging = this.playerDigging;
this.playerDigging = function(...args) {
    originalPlayerDigging.call(this, ...args);
    onPlayerDigging(...args);
};

function onPlayerDigging(...args) {
    if (enabledModules["FastBreak"]) {
        breakStart = Date.now();
    }
}

const originalPlayerBlockPlacement = this.playerBlockPlacement;
this.playerBlockPlacement = function(...args) {
    if (enabledModules["FastPlace"]) {
        player$1.placeBlock(args[0], args[1], args[2], args[3]);
    } else {
        originalPlayerBlockPlacement.call(this, ...args);
    }
};

const originalPlayerAction = this.playerAction;
this.playerAction = function(...args) {
    if (enabledModules["FastBreak"] && args[0] == "START_BREAK") {
        breakStart = Date.now();
    }
    originalPlayerAction.call(this, ...args);
};

const originalPlayerMovement = this.playerMovement;
this.playerMovement = function(...args) {
    if (enabledModules["NoSlow"] && blocking) {
        args[0] *= 0.2;
        args[1] *= 0.2;
    }
    if (enabledModules["AntiKick"] && noMove > Date.now()) {
        args[0] = args[1] = 0;
    }
    originalPlayerMovement.call(this, ...args);
};

const originalEntityAction = this.entityAction;
this.entityAction = function(...args) {
    if (enabledModules["Sprint"] && args[1] == "START_SPRINTING") {
        player$1.setSprinting(true);
    } else if (enabledModules["Sprint"] && args[1] == "STOP_SPRINTING") {
        player$1.setSprinting(false);
    } else if (enabledModules["Sneak"] && args[1] == "START_SNEAKING") {
        player$1.setSneaking(true);
    } else if (enabledModules["Sneak"] && args[1] == "STOP_SNEAKING") {
        player$1.setSneaking(false);
    }
    originalEntityAction.call(this, ...args);
};

const originalPlayerInput = this.playerInput;
this.playerInput = function(...args) {
    if (enabledModules["NoSlow"] && blocking) {
        args[0] *= 0.2;
        args[1] *= 0.2;
    }
    if (enabledModules["InfiniteJump"] && player\$1.abilities.jumpAllowed && args[2]) {
        player$1.jump();
    }
    originalPlayerInput.call(this, ...args);
};

const originalPlayerAbilities = this.playerAbilities;
this.playerAbilities = function(...args) {
    if (enabledModules["InfiniteJump"]) {
        args[3] = true;
    }
    originalPlayerAbilities.call(this, ...args);
};

const originalPlayerPositionAndRotation = this.playerPositionAndRotation;
this.playerPositionAndRotation = function(...args) {
    if (enabledModules["RotationFix"]) {
        args[3] = player$1.yaw;
        args[4] = player$1.pitch;
    }
    if (enabledModules["AntiKick"] && noMove > Date.now()) {
        return;
    }
    originalPlayerPositionAndRotation.call(this, ...args);
};

const originalPlayerKeepAlive = this.playerKeepAlive;
this.playerKeepAlive = function(...args) {
    if (enabledModules["AntiKick"]) {
        return;
    }
    originalPlayerKeepAlive.call(this, ...args);
};

const originalPlayerUseEntity = this.playerUseEntity;
this.playerUseEntity = function(...args) {
    if (enabledModules["KillAura"]) {
        attackedEntity = args[0];
        if (Date.now() - attackTime > 500) {
            attackTime = Date.now();
            const entity = player$1.world.getEntityById(args[0]);
            if (entity && entity.team != player\$1.team) {
                player$1.attack(entity);
            }
        }
    }
    originalPlayerUseEntity.call(this, ...args);
};

const originalPlayerAnimation = this.playerAnimation;
this.playerAnimation = function(...args) {
    if (enabledModules["FastBreak"]) {
        if (Date.now() - breakStart > 50) {
            breakStart = Date.now();
            player$1.breakBlock();
        }
    }
    originalPlayerAnimation.call(this, ...args);
};

const originalPlayerMessage = this.playerMessage;
this.playerMessage = function(...args) {
    if (player\$1 && args[0] && !args[0].startsWith(player$1.name) && enabledModules["ChatDisabler"] && chatDelay < Date.now()) {
        chatDelay = Date.now() + 1000;
        setTimeout(function() {
            ClientSocket.sendPacket(new SPacketChatMessage(chatdisablermsg || "Chat is disabled by Vape V4."));
        }, 100);
        return;
    }
    if (player\$1 && args[0] && args[0].startsWith(player$1.name) && enabledModules["ChatHighlight"] && chatDelay < Date.now()) {
        chatDelay = Date.now() + 1000;
        const highlightColor = enabledModules["ChatHighlight"].options.Color;
        const msg = args[0].replace(new RegExp(player$1.name, 'g'), `<span style="color:${highlightColor};">${player$1.name}</span>`);
        setTimeout(function() {
            ClientSocket.sendPacket(new SPacketChatMessage(msg));
        }, 100);
        return;
    }
    if (player$1 && args[0] && enabledModules["ChatTimestamp"]) {
        const timestampColor = enabledModules["ChatTimestamp"].options.Color;
        const msg = `<span style="color:${timestampColor};">[${new Date().toLocaleTimeString()}]</span> ${args[0]}`;
        setTimeout(function() {
            ClientSocket.sendPacket(new SPacketChatMessage(msg));
        }, 100);
        return;
    }
    originalPlayerMessage.call(this, ...args);
};

const originalJoinGame = this.joinGame;
this.joinGame = function(...args) {
    if (enabledModules["AutoRespawn"]) {
        setTimeout(function() {
            player$1.respawn();
        }, 1000);
    }
    originalJoinGame.call(this, ...args);
};
const originalChatInput = this.chatInput;
this.chatInput = function(...args) {
    if (enabledModules["ChatDisabler"] && chatDelay < Date.now()) {
        chatDelay = Date.now() + 1000;
        setTimeout(function() {
            ClientSocket.sendPacket(new SPacketChatMessage(chatdisablermsg || "Chat is disabled by Vape V4."));
        }, 100);
        return;
    }
    originalChatInput.call(this, ...args);
};

const originalPacketReceived = this.packetReceived;
this.packetReceived = function(packet) {
    if (packet instanceof CPacketMessage) {
        if (player\$1 && packet.text && !packet.text.startsWith(player$1.name) && enabledModules["ChatDisabler"] && chatDelay < Date.now()) {
            chatDelay = Date.now() + 1000;
            setTimeout(function() {
                ClientSocket.sendPacket(new SPacketChatMessage(chatdisablermsg || "Chat is disabled by Vape V4."));
            }, 100);
            return;
        }
        if (player\$1 && packet.text && packet.text.startsWith(player$1.name) && enabledModules["ChatHighlight"] && chatDelay < Date.now()) {
            chatDelay = Date.now() + 1000;
            const highlightColor = enabledModules["ChatHighlight"].options.Color;
            const msg = packet.text.replace(new RegExp(player$1.name, 'g'), `<span style="color:${highlightColor};">${player$1.name}</span>`);
            setTimeout(function() {
                ClientSocket.sendPacket(new SPacketChatMessage(msg));
            }, 100);
            return;
        }
        if (player$1 && packet.text && enabledModules["ChatTimestamp"]) {
            const timestampColor = enabledModules["ChatTimestamp"].options.Color;
            const msg = `<span style="color:${timestampColor};">[${new Date().toLocaleTimeString()}]</span> ${packet.text}`;
            setTimeout(function() {
                ClientSocket.sendPacket(new SPacketChatMessage(msg));
            }, 100);
            return;
        }
    }
    originalPacketReceived.call(this, packet);
};

const originalPlayerJoinGame = this.playerJoinGame;
this.playerJoinGame = function(...args) {
    if (enabledModules["AutoRejoin"] && lastJoined && Date.now() - lastJoined < 5000) {
        this.joinGame(...args);
    } else {
        originalPlayerJoinGame.call(this, ...args);
        lastJoined = Date.now();
    }
};

const originalPlayerPositionAndLook = this.playerPositionAndLook;
this.playerPositionAndLook = function(...args) {
    if (enabledModules["AntiKick"] && noMove > Date.now()) {
        return;
    }
    originalPlayerPositionAndLook.call(this, ...args);
};

this.addKeybind = function(module, bind, callback) {
    keybindCallbacks[bind] = () => callback();
    setModuleBinding(module, bind);
};

this.removeKeybind = function(module) {
    const oldBind = modules[module].bind;
    delete keybindCallbacks[oldBind];
    setModuleBinding(module, null);
};

this.toggleModule = toggleModule;
this.setModuleBinding = setModuleBinding;
this.setModuleOption = setModuleOption;

this.loadVape = loadVape;
this.loadSpritesheet = loadSpritesheet;

window["vape"] = this;
let player$1 = null;
let lastJoinedTime = 0;

this.joinEvent = function(player) {
    player$1 = player;
    velocityhori = player$1.velocityHorizontal;
    velocityvert = player$1.velocityVertical;
    stepheight = player$1.stepHeight;
    textguifont = ["Arial", "Arial"];
    textguisize = [16, 16];
    textguishadow = [true, true];
    chatdisablermsg = "Chat is disabled by Vape V4.";
};

this.leftEvent = function() {
    player$1 = null;
};

this.tickEvent = function() {
    onTick();
};

this.renderEvent = function() {
    onRender();
};

this.windowClickEvent = function(...args) {
    onWindowClick(...args);
};

this.entityDamageEvent = function(...args) {
    onEntityDamage(...args);
};

this.playerInventoryChangeEvent = function(...args) {
    onPlayerInventoryChange(...args);
};

this.heldItemChangeEvent = function(...args) {
    onHeldItemChange(...args);
};

this.playerDiggingEvent = function(...args) {
    onPlayerDigging(...args);
};

this.playerBlockPlacementEvent = function(...args) {
    originalPlayerBlockPlacement.call(this, ...args);
};

this.playerActionEvent = function(...args) {
    onPlayerAction(...args);
};

this.playerMovementEvent = function(...args) {
    originalPlayerMovement.call(this, ...args);
};

this.entityActionEvent = function(...args) {
    originalEntityAction.call(this, ...args);
};

this.playerInputEvent = function(...args) {
    originalPlayerInput.call(this, ...args);
};

this.playerAbilitiesEvent = function(...args) {
    originalPlayerAbilities.call(this, ...args);
};

this.playerPositionAndRotationEvent = function(...args) {
    originalPlayerPositionAndRotation.call(this, ...args);
};

this.playerKeepAliveEvent = function(...args) {
    originalPlayerKeepAlive.call(this, ...args);
};

this.playerUseEntityEvent = function(...args) {
    originalPlayerUseEntity.call(this, ...args);
};

this.playerAnimationEvent = function(...args) {
    originalPlayerAnimation.call(this, ...args);
};

this.playerMessageEvent = function(...args) {
    originalPlayerMessage.call(this, ...args);
};

this.chatInputEvent = function(...args) {
    originalChatInput.call(this, ...args);
};

this.packetReceivedEvent = function(packet) {
    originalPacketReceived.call(this, packet);
};

this.playerJoinGameEvent = function(...args) {
    originalPlayerJoinGame.call(this, ...args);
};

this.playerPositionAndLookEvent = function(...args) {
    originalPlayerPositionAndLook.call(this, ...args);
};

const originalStart = this.start;
this.start = async function() {
    await loadSpritesheet();
    originalStart.call(this);
};

const originalStop = this.stop;
this.stop = function() {
    clearInterval(renderTickLoopId);
    clearInterval(tickLoopId);
    originalStop.call(this);
};
