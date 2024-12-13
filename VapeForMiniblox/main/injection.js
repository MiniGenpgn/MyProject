// Object for storing replacements
let replacements = {};

// Modify code by replacing identifiers based on the `dumpedVarNames` mapping
function modifyCode(text) {
  for (const [name, regex] of Object.entries(dumpedVarNames)) {
    const matched = text.match(regex);
    if (matched) {
      console.log(name, regex, matched);
      for (const [replacement, code] of Object.entries(replacements)) {
        // Update the replacement object by replacing the identifier dynamically
        delete replacements[replacement];
        replacements[replacement.replaceAll(name, matched[1])] = [
          code[0].replaceAll(name, matched[1]),
          code[1]
        ];
      }
    }
  }

  // Apply replacements to the text content
  for (const [replacement, code] of Object.entries(replacements)) {
    text = text.replaceAll(replacement, code[1] ? code[0] : replacement + code[0]);
  }
  return text;
}

// Add a replacement rule to the replacements object
function addReplacement(replacement, code, replaceit = false) {
  replacements[replacement] = [code, replaceit];
}

// Helper function to replace and copy functions
function replaceAndCopyFunction(oldFunc, newFunc) {
  return new Proxy(oldFunc, {
    apply(orig, origIden, origArgs) {
      try {
        const result = orig.apply(origIden, origArgs);
        newFunc(result);  // Execute the new function after the original
        return result;
      } catch (error) {
        console.error("Error in function proxy:", error);
      }
    },
    get(orig) {
      return orig;
    }
  });
}

// Example replacements
addReplacement('"CPacketEntityVelocity",$=>{const et=j.world.entitiesDump.get($.id);', `
  if (player$1 && $.id == player$1.id && enabledModules["Velocity"]) {
    if (velocityhori[1] == 0 && velocityvert[1] == 0) return;
    $.motion = new Vector3$1($.motion.x * velocityhori[1], $.motion.y * velocityvert[1], $.motion.z * velocityhori[1]);
  }
`);

addReplacement('ClientSocket.on("CPacketMessage",$=>{', `
  if (player$1 && $.text && !$.text.startsWith(player$1.name) && enabledModules["ChatDisabler"] && chatDelay < Date.now()) {
    chatDelay = Date.now() + 1000;
    setTimeout(function() {
      ClientSocket.sendPacket(new SPacketMessage({text: Math.random() + ("\\n" + chatdisablermsg[1]).repeat(20)}));
    }, 50);
  }
`);

addReplacement('(this.drawSelectedItemStack(),this.drawHintBox())', `
  if (ctx$3 && enabledModules["TextGUI"]) {
    // Custom drawing logic
  }
`);

// Escapes special characters in a string for use in a regular expression
function escapeRegExp(str) {
  return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&"); // escape special characters
}

// The async `loadSpritesheet` method to handle sprite sheet loading
async function loadSpritesheet() {
  await this.loadVape();  // Ensure vape texture is loaded first
  super.loadSpritesheet();  // Now you can call the parent method if needed
}

// Ensure there's only one definition of the `replaceAndCopyFunction`
function replaceAndCopyFunction(oldFunc, newFunc) {
  return new Proxy(oldFunc, {
    apply(orig, origIden, origArgs) {
      const result = orig.apply(origIden, origArgs);
      newFunc(result);  // Execute the new function after the original
      return result;
    },
    get(orig) {
      return orig;
    }
  });
}

// Setup hooks for Object.getOwnPropertyNames and Object.getOwnPropertyDescriptors to prevent certain variables from being dumped
Object.getOwnPropertyNames = replaceAndCopyFunction(Object.getOwnPropertyNames, function(list) {
    if (list.indexOf(storeName) != -1) list.splice(list.indexOf(storeName), 1);
    return list;
});
Object.getOwnPropertyDescriptors = replaceAndCopyFunction(Object.getOwnPropertyDescriptors, function(list) {
    delete list[storeName];
    return list;
});

// Module management
const replacements = {};
const dumpedVarNames = {};
const storeName = "a" + crypto.randomUUID().replaceAll("-", "").substring(16);
const vapeName = crypto.randomUUID().replaceAll("-", "").substring(16);

// Helper function to add replacement logic
function addReplacement(replacement, code, replaceit = false) {
    replacements[replacement] = [code, replaceit];
}

// Helper function to add variable dumping patterns
function addDump(replacement, code) {
    dumpedVarNames[replacement] = code;
}

// Modify code by replacing variables or function names
function modifyCode(text) {
    // Replace dumped variables
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

    // Apply replacements to the code
    for (const [replacement, code] of Object.entries(replacements)) {
        text = text.replaceAll(replacement, code[1] ? code[0] : replacement + code[0]);
    }

    // Inject modified script into the page
    const newScript = document.createElement("script");
    newScript.type = "module";
    newScript.crossOrigin = "";
    newScript.textContent = text;
    const head = document.querySelector("head");
    head.appendChild(newScript);
    newScript.textContent = "";
    newScript.remove();
}

// Initialize dumping and replacements
(function() {
    'use strict';

    // DUMPING VARIABLE DEFINITIONS
    addDump('moveStrafeDump', 'strafe:this\.([a-zA-Z]*)');
    addDump('moveForwardDump', 'forward:this\.([a-zA-Z]*)');
    addDump('keyPressedDump', 'function ([a-zA-Z]*)\\(j\\)\{return keyPressed\\(j\\}');
    addDump('entitiesDump', 'this\.([a-zA-Z]*)\.values\\(\\)\\)nt instanceof EntityTNTPrimed');
    addDump('isInvisibleDump', 'ot\.([a-zA-Z]*)\\(\\)\\)&&\\(pt=new ([a-zA-Z]*)\\(new');
    addDump('attackDump', 'hitVec.z\}\\)\}\\)\\),player\\$1\.([a-zA-Z]*)');
    addDump('lastReportedYawDump', 'this\.([a-zA-Z]*)=this\.yaw,this\.last');
    addDump('windowClickDump', '([a-zA-Z]*)\\(this\.inventorySlots\.windowId');
    addDump('playerControllerDump', 'const ([a-zA-Z]*)=new PlayerController,');
    addDump('damageReduceAmountDump', 'ItemArmor&&\\(tt\\+\\=it\.([a-zA-Z]*)');
    addDump('boxGeometryDump', 'ot=new Mesh\\(new ([a-zA-Z]*)\\(1');
    addDump('syncItemDump', 'playerControllerMP\.([a-zA-Z]*)\\(\\),ClientSocket\.sendPacket');

    // PRE-FUNCTION REPLACEMENTS
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
                if (name.toLowerCase() == str.toLowerCase()) return module;
            }
        }

        let j;
        for (j = 0; j < 26; j++) keybindList[j + 65] = keybindList["Key" + String.fromCharCode(j + 65)] = String.fromCharCode(j + 97);
        for (j = 0; j < 10; j++) keybindList[48 + j] = keybindList["Digit" + j] = "" + j;
        window.addEventListener("keydown", function(key) {
            const func = keybindCallbacks[keybindList[key.code]];
            call$1(func, key);
        });
    `);

    // TEXTURE & IMAGE REPLACEMENTS
    addReplacement('skinManager.loadTextures(),', ',this.loadVape(),');
    addReplacement('async loadSpritesheet(){', `
        async loadVape() {
            this.vapeTexture = await this.loader.loadAsync("https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/assets/logo.png");
            this.v4Texture = await this.loader.loadAsync("https://raw.githubusercontent.com/7GrandDadPGN/VapeForMiniblox/main/assets/logov4.png");
        }
        async loadSpritesheet(){
    `, true);

    // MODULE FUNCTION REPLACEMENTS
    addReplacement('player$1.setPositionAndRotation($.x,$.y,$.z,$.yaw,$.pitch),', `
        noMove = Date.now() + 500;
        player$1.setPositionAndRotation($.x,$.y,$.z,$.yaw,$.pitch),
    `, true);

    // ANTI-CHEAT AND HOOKING
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

    // CHAT, BIND, AND KEY FUNCTIONALITY FIXES
    addReplacement('bindKeysWithDefaults("b",j=>{', 'bindKeysWithDefaults("semicolon",j=>{', true);
    addReplacement('bindKeysWithDefaults("i",j=>{', 'bindKeysWithDefaults("apostrophe",j=>{', true);

    // VELOCITY MODIFICATION
    addReplacement('"CPacketEntityVelocity",$=>{const et=j.world.entitiesDump.get($.id);', `
        if (player$1 && $.id == player$1.id && enabledModules["Velocity"]) {
            if (velocityhori[1] == 0 && velocityvert[1] == 0) return;
            $.motion = new Vector3$1($.motion.x * velocityhori[1], $.motion.y * velocityvert[1], $.motion.z * velocityhori[1]);
        }
    `);

    addReplacement('"CPacketExplosion",$=>{', `
        if ($.playerPos && enabledModules["Velocity"]) {
            if (velocityhori[1] == 0 && velocityvert[1] == 0) return;
            $.playerPos = new Vector3$1($.playerPos.x * velocityhori[1], $.playerPos.y * velocityvert[1],
addReplacement('tryExecuteClientside(et,_))return;', `
    const str = $.toLocaleLowerCase();
    const args = str.split(" ");
    let chatString;

    switch (args[0]) {
        case ".bind":
            const module = args.length > 2 && getModule(args[1]);
            if (module) module.setbind(args[2] === "none" ? "" : args[2], true);
            return;

        case ".t":
        case ".toggle":
            if (args.length > 1) {
                const module = getModule(args[1]);
                if (module) {
                    module.toggle();
                    game$1.chat.addChat({
                        text: module.name + (module.enabled ? " Enabled!" : " Disabled!"),
                        color: module.enabled ? "lime" : "red"
                    });
                } else if (args[1] === "all") {
                    Object.values(modules).forEach(m => m.toggle());
                }
            }
            return;

        case ".modules":
            chatString = "Module List\\n";
            Object.keys(modules).forEach(name => {
                chatString += "\\n" + name;
            });
            game$1.chat.addChat({ text: chatString });
            return;

        case ".binds":
            chatString = "Bind List\\n";
            Object.entries(modules).forEach(([name, module]) => {
                chatString += "\\n" + name + " : " + (module.bind !== "" ? module.bind : "none");
            });
            game$1.chat.addChat({ text: chatString });
            return;

        case ".setoption":
            const moduleOption = getModule(args[1]);
            if (moduleOption) {
                if (args.length < 3) {
                    chatString = moduleOption.name + " Options";
                    Object.entries(moduleOption.options).forEach(([name, value]) => {
                        chatString += "\\n" + name + " : " + value[0].name + " : " + value[1];
                    });
                    game$1.chat.addChat({ text: chatString });
                    return;
                }

                let option;
                Object.entries(moduleOption.options).forEach(([name, value]) => {
                    if (name.toLocaleLowerCase() === args[2].toLocaleLowerCase()) option = value;
                });

                if (option) {
                    if (option[0] === Number) option[1] = !isNaN(Number.parseFloat(args[3])) ? Number.parseFloat(args[3]) : option[1];
                    else if (option[0] === Boolean) option[1] = args[3] === "true";
                    else if (option[0] === String) option[1] = args.slice(3).join(" ");
                    game$1.chat.addChat({ text: "Set " + moduleOption.name + " " + option[2] + " to " + option[1] });
                }
            }
            return;

        case ".config":
        case ".profile":
            if (args.length > 1) {
                switch (args[1]) {
                    case "save":
                        globalThis.${storeName}.saveVapeConfig(args[2]);
                        game$1.chat.addChat({ text: "Saved config " + args[2] });
                        break;
                    case "load":
                        globalThis.${storeName}.loadVapeConfig(args[2]);
                        game$1.chat.addChat({ text: "Loaded config " + args[2] });
                        break;
                    case "import":
                        globalThis.${storeName}.importVapeConfig(args[2]);
                        game$1.chat.addChat({ text: "Imported config" });
                        break;
                    case "export":
                        globalThis.${storeName}.exportVapeConfig();
                        game$1.chat.addChat({ text: "Config set to clipboard!" });
                        break;
                }
            }
            return;
    }

    if (enabledModules["FilterBypass"] && !$.startsWith('/')) {
        const words = $.split(" ");
        let newwords = words.map(word => word.charAt(0) + '‎' + word.slice(1));
        $ = newwords.join(' ');
    }
`);
addReplacement('document.addEventListener("contextmenu", j => j.preventDefault());', `
    // My code lol
    (function() {
        class Module {
            constructor(name, func) {
                this.name = name;
                this.func = func;
                this.enabled = false;
                this.bind = "";
                this.options = {};
                modules[this.name] = this;
            }
            toggle() {
                this.enabled = !this.enabled;
                enabledModules[this.name] = this.enabled;
                this.func(this.enabled);
            }
            setbind(key, manual) {
                if (this.bind !== "") delete keybindCallbacks[this.bind];
                this.bind = key;
                if (manual) game$1.chat.addChat({ text: "Bound " + this.name + " to " + (key === "" ? "none" : key) + "!" });
                if (key === "") return;

                keybindCallbacks[this.bind] = function() {
                    if (Game.isActive()) {
                        this.toggle();
                        game$1.chat.addChat({
                            text: this.name + (this.enabled ? " Enabled!" : " Disabled!"),
                            color: this.enabled ? "lime" : "red"
                        });
                    }
                }.bind(this);
            }
            addoption(name, type, defaultValue) {
                this.options[name] = [type, defaultValue, name];
                return this.options[name];
            }
        }

        let clickDelay = Date.now();
        new Module("AutoClicker", function(callback) {
            if (callback) {
                tickLoop["AutoClicker"] = function() {
                    if (clickDelay < Date.now() && playerControllerDump.key.leftClick && !player$1.isUsingItem()) {
                        playerControllerDump.leftClick();
                        clickDelay = Date.now() + 60;
                    }
                }
            } else {
                delete tickLoop["AutoClicker"];
            }
        });

        new Module("Sprint", function() {});
        const velocity = new Module("Velocity", function() {});
        velocityhori = velocity.addoption("Horizontal", Number, 0);
        velocityvert = velocity.addoption("Vertical", Number, 0);

        new Module("WTap", function() {});
        new Module("AntiFall", function(callback) {
            if (callback) {
                let ticks = 0;
                tickLoop["AntiFall"] = function() {
                    const ray = rayTraceBlocks(player$1.getEyePos(), player$1.getEyePos().clone().setY(0), false, false, false, game$1.world);
                    if (player$1.fallDistance > 2.8 && !ray) {
                        player$1.motion.y = 0;
                    }
                };
            } else {
                delete tickLoop["AntiFall"];
            }
        });

        let attackDelay = Date.now();
        let didSwing = false;
        let attacked = 0;
        let attackedPlayers = {};
        let attackList = [];
        let boxMeshes = [];
        let killaurarange, killaurablock, killaurabox, killauraangle, killaurawall, killauraitem;

        // killaura related functions go here (wrapAngleTo180_radians, killauraAttack, etc.)

        const killaura = new Module("Killaura", function(callback) {
            if (callback) {
                for (let i = 0; i < 10; i++) {
                    const mesh = new Mesh(new boxGeometryDump(1, 2, 1));
                    mesh.material.depthTest = false;
                    mesh.material.transparent = true;
                    mesh.material.opacity = 0.5;
                    mesh.material.color.set(255, 0, 0);
                    mesh.renderOrder = 6;
                    game$1.gameScene.ambientMeshes.add(mesh);
                    boxMeshes.push(mesh);
                }

                tickLoop["Killaura"] = function() {
                    attacked = 0;
                    didSwing = false;
                    const localPos = controls.position.clone();
                    const localTeam = getTeam(player$1);
                    const entities = game$1.world.entitiesDump;

                    attackList = [];
                    if (!killauraitem[1] || swordCheck()) {
                        entities.forEach(entity => {
                            if (entity.id !== player$1.id) {
                                const newDist = player$1.getDistanceSqToEntity(entity);
                                if (newDist < (killaurarange[1] * killaurarange[1]) && entity instanceof EntityPlayer) {
                                    if (entity.mode.isSpectator() || entity.mode.isCreative() || entity.isInvisibleDump()) return;
                                    if (localTeam && localTeam === getTeam(entity)) return;
                                    if (killaurawall[1] && !player$1.canEntityBeSeen(entity)) return;
                                    attackList.push(entity);
                                }
                            }
                        });
                    }

                    attackList.sort((a, b) => (attackedPlayers[a.id] || 0) - (attackedPlayers[b.id] || 0));

                    attackList.forEach(entity => killauraAttack(entity, attackList[0] === entity));

                    if (attackList.length > 0) block();
                    else unblock();
                };

                renderTickLoop["Killaura"] = function() {
                    boxMeshes.forEach((box, index) => {
                        const entity = attackList[index];
                        box.visible = entity !== undefined && killaurabox[1];
                        if (box.visible) {
                            const pos = entity.mesh.position;
                            box.position.copy(new Vector3$1(pos.x, pos.y + 1, pos.z));
                        }
                    });
                };
            } else {
                delete tickLoop["Killaura"];
                delete renderTickLoop["Killaura"];
                boxMeshes.forEach(box => box.visible = false);
                boxMeshes.splice(0);
                unblock();
            }
        });

        killaurarange = killaura.addoption("Range", Number, 9);
        killauraangle = killaura.addoption("Angle", Number, 360);
        killaurablock = killaura.addoption("AutoBlock", Boolean, true);
        killaurawall = killaura.addoption("Wallcheck", Boolean, false);
        killaurabox = killaura.addoption("Box", Boolean, true);
        killauraitem = killaura.addoption("LimitToSword", Boolean, false);
    })();
`);
addReplacement('document.addEventListener("contextmenu", j => j.preventDefault());', `
    // Main module setup code
    (function() {
        // Define the Module class
        class Module {
            constructor(name, func) {
                this.name = name;
                this.func = func;
                this.enabled = false;
                this.bind = "";
                this.options = {};
                modules[this.name] = this; // Add module to global module list
            }

            // Toggle module on/off
            toggle() {
                this.enabled = !this.enabled;
                enabledModules[this.name] = this.enabled;
                this.func(this.enabled); // Execute the module function based on enabled status
            }

            // Set a keybinding for the module
            setbind(key, manual) {
                if (this.bind !== "") delete keybindCallbacks[this.bind]; // Unbind previous key
                this.bind = key;
                if (manual) game$1.chat.addChat({ text: "Bound " + this.name + " to " + (key === "" ? "none" : key) + "!" });

                // Skip if key is empty
                if (key === "") return;

                // Set up the keybind callback
                keybindCallbacks[this.bind] = function() {
                    if (Game.isActive()) {
                        this.toggle();
                        game$1.chat.addChat({
                            text: this.name + (this.enabled ? " Enabled!" : " Disabled!"),
                            color: this.enabled ? "lime" : "red"
                        });
                    }
                }.bind(this);
            }

            // Add an option to the module
            addoption(name, type, defaultValue) {
                this.options[name] = [type, defaultValue, name];
                return this.options[name];
            }
        }

        // AutoClicker Module
        let clickDelay = Date.now();
        new Module("AutoClicker", function(callback) {
            if (callback) {
                tickLoop["AutoClicker"] = function() {
                    if (clickDelay < Date.now() && playerControllerDump.key.leftClick && !player$1.isUsingItem()) {
                        playerControllerDump.leftClick();
                        clickDelay = Date.now() + 60; // Delay between clicks
                    }
                };
            } else {
                delete tickLoop["AutoClicker"]; // Remove tick loop when disabled
            }
        });

        // Other modules (Sprint, Velocity, etc.)
        new Module("Sprint", function() {}); // Sprint module (empty functionality for now)

        const velocity = new Module("Velocity", function() {});
        velocityhori = velocity.addoption("Horizontal", Number, 0); // Option for horizontal velocity
        velocityvert = velocity.addoption("Vertical", Number, 0); // Option for vertical velocity

        new Module("WTap", function() {}); // WTap module (empty functionality for now)

        // AntiFall module (prevents fall damage)
        new Module("AntiFall", function(callback) {
            if (callback) {
                let ticks = 0;
                tickLoop["AntiFall"] = function() {
                    const ray = rayTraceBlocks(player$1.getEyePos(), player$1.getEyePos().clone().setY(0), false, false, false, game$1.world);
                    if (player$1.fallDistance > 2.8 && !ray) {
                        player$1.motion.y = 0; // Prevent fall damage if conditions are met
                    }
                };
            } else {
                delete tickLoop["AntiFall"];
            }
        });

        // Killaura module
        let attackDelay = Date.now();
        let didSwing = false;
        let attacked = 0;
        let attackedPlayers = {};
        let attackList = [];
        let boxMeshes = [];

        const killaura = new Module("Killaura", function(callback) {
            if (callback) {
                // Create meshes for Killaura (visual representation)
                for (let i = 0; i < 10; i++) {
                    const mesh = new Mesh(new boxGeometryDump(1, 2, 1)); // Dummy geometry for box
                    mesh.material.depthTest = false;
                    mesh.material.transparent = true;
                    mesh.material.opacity = 0.5;
                    mesh.material.color.set(255, 0, 0); // Red color for Killaura boxes
                    mesh.renderOrder = 6;
                    game$1.gameScene.ambientMeshes.add(mesh);
                    boxMeshes.push(mesh); // Store the meshes for later reference
                }

                // Tick loop for Killaura (attack logic)
                tickLoop["Killaura"] = function() {
                    attacked = 0;
                    didSwing = false;
                    const localPos = controls.position.clone();
                    const localTeam = getTeam(player$1);
                    const entities = game$1.world.entitiesDump;

                    attackList = [];
                    if (!killauraitem[1] || swordCheck()) { // Only activate if sword is equipped
                        entities.forEach(entity => {
                            if (entity.id !== player$1.id) {
                                const newDist = player$1.getDistanceSqToEntity(entity);
                                if (newDist < (killaurarange[1] * killaurarange[1]) && entity instanceof EntityPlayer) {
                                    if (entity.mode.isSpectator() || entity.mode.isCreative() || entity.isInvisibleDump()) return;
                                    if (localTeam && localTeam === getTeam(entity)) return;
                                    if (killaurawall[1] && !player$1.canEntityBeSeen(entity)) return;
                                    attackList.push(entity);
                                }
                            }
                        });
                    }

                    // Sort attack list based on priority (attacked players first)
                    attackList.sort((a, b) => (attackedPlayers[a.id] || 0) - (attackedPlayers[b.id] || 0));

                    // Perform attacks
                    attackList.forEach(entity => killauraAttack(entity, attackList[0] === entity));

                    // Block or unblock based on attack status
                    if (attackList.length > 0) block();
                    else unblock();
                };

                // Render tick for Killaura (displaying box meshes around targets)
                renderTickLoop["Killaura"] = function() {
                    boxMeshes.forEach((box, index) => {
                        const entity = attackList[index];
                        box.visible = entity !== undefined && killaurabox[1];
                        if (box.visible) {
                            const pos = entity.mesh.position;
                            box.position.copy(new Vector3$1(pos.x, pos.y + 1, pos.z)); // Adjust position above target
                        }
                    });
                };
            } else {
                // Disable Killaura
                delete tickLoop["Killaura"];
                delete renderTickLoop["Killaura"];
                boxMeshes.forEach(box => box.visible = false);
                boxMeshes.splice(0); // Clear the box meshes
                unblock();
            }
        });

        // Killaura options (Range, Angle, etc.)
        killaurarange = killaura.addoption("Range", Number, 9);
        killauraangle = killaura.addoption("Angle", Number, 360);
        killaurablock = killaura.addoption("AutoBlock", Boolean, true);
        killaurawall = killaura.addoption("Wallcheck", Boolean, false);
        killaurabox = killaura.addoption("Box", Boolean, true);
        killauraitem = killaura.addoption("LimitToSword", Boolean, false);
    })();
`);
