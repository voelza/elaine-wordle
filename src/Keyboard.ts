import { component, state } from "elaine";
import State from "elaine/dist/states/State";

export default component({
    name: "keyboard",
    template: `
    <div class="keyboard">
        <div class="keyboard-row">
        <div @@for="key in @@firstRow" class="key" @@class="{@@alreadyUsed(@@usedKeys,@@key) : used}" ++click="addInput(@@key)">@@{key}</div>
        </div>
        <div class="keyboard-row">
            <div @@for="key in @@secondRow" class="key" @@class="{@@alreadyUsed(@@usedKeys,@@key) : used}" ++click="addInput(@@key)">@@{key}</div>
            <div class="key" ++click="enter">Enter</div>
        </div>
        <div class="keyboard-row">
            <div @@for="key in @@thirdRow" class="key" @@class="{@@alreadyUsed(@@usedKeys,@@key) : used}" ++click="addInput(@@key)">@@{key}</div>
        </div>
    </div>
    `,
    css: `
    .keyboard {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
        margin-top: auto;
    }

    .keyboard-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
    }

    .key {
        min-width: 20px;
        height: 20px;
        padding: 5px;
        border: 1px solid gray;
        border-radius: 5px;
        background-color: white;
        cursor: pointer;
        text-transform: capitalize;
    }

    .key:hover {
        background-color: #b3b0b0;
    }

    .used {
        background-color: lightgray;
    }
    `,
    setup: (instance) => {
        const usedKeys: State<string[]> = state([]);
        instance.addGlobalEventListener("enter", (input: string) => {
            usedKeys.value = [...usedKeys.value, ...input];
        });

        instance.addGlobalEventListener("reset", () => {
            usedKeys.value = [];
        });

        return {
            state: {
                usedKeys,
                firstRow: [..."qwertyuiop"],
                secondRow: [..."asdfghjkl"],
                thirdRow: [..."zxcvbnnm"],
                alreadyUsed: (usedKeys: string[], key: string): boolean => {
                    return usedKeys.includes(key);
                },
                addInput: (key: string) => {
                    instance.dispatchGlobalEvent("handleKeyInput", key);
                },
                enter: () => {
                    instance.dispatchGlobalEvent("handleEnter");
                }
            }
        }
    }
});