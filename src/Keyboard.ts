import { component, inert, state } from "elaine";
import State from "elaine/dist/states/State";

export default component({
    name: "keyboard",
    template: `
    <div class="keyboard">
        <div class="keyboard-row">
        <div @@for="key in @@firstRow" class="key" @@class="{@@alreadyUsed(@@usedKeys,@@key) : used; @@getLetterStatus(@@letterStatus,@@key) == 0 : green; @@getLetterStatus(@@letterStatus,@@key) == 1: yellow}" ++click="addInput(@@key)">@@{key}</div>
        </div>
        <div class="keyboard-row">
            <div @@for="key in @@secondRow" class="key" @@class="{@@alreadyUsed(@@usedKeys,@@key) : used; @@getLetterStatus(@@letterStatus,@@key) == 0 : green; @@getLetterStatus(@@letterStatus,@@key) == 1: yellow}"" ++click="addInput(@@key)">@@{key}</div>
        </div>
        <div class="keyboard-row">
            <div class="key" ++click="enter">Enter</div>
            <div @@for="key in @@thirdRow" class="key" @@class="{@@alreadyUsed(@@usedKeys,@@key) : used; @@getLetterStatus(@@letterStatus,@@key) == 0 : green; @@getLetterStatus(@@letterStatus,@@key) == 1: yellow}" ++click="addInput(@@key)">@@{key}</div>
            <div class="key" ++click="backspace">⌫</div>
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
        min-width: 17px;
        height: 20px;
        padding: 5px;
        border: 1px solid gray;
        border-radius: 5px;
        background-color: white;
        cursor: pointer;
        text-transform: capitalize;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .key:hover {
        background-color: #b3b0b0;
    }

    .used {
        background-color: lightgray;
    }

    .green  {
        background-color: #83e383;
    }

    .yellow {
        background-color: #f9f9a3;
    }
    `,
    props: [
        {
            name: "usedKeys",
            type: Array
        }
    ],
    setup: (instance) => {
        const usedKeys: State<string[]> = state(instance.data.usedKeys.value ?? []);
        instance.addGlobalEventListener("enter", (input: string) => {
            usedKeys.value = [...usedKeys.value, ...input];
        });

        instance.addGlobalEventListener("reset", () => {
            usedKeys.value = [];
        });

        const letterStatus = inert(new Map<string, number>());
        instance.addGlobalEventListener("letterStatus", ({ letter, status }) => {
            const currentStatus = letterStatus.value.get(letter);
            if (currentStatus === undefined) {
                letterStatus.value.set(letter, status);
                letterStatus.notify();
            } else if (currentStatus !== undefined && currentStatus > status) {
                letterStatus.value.set(letter, status);
                letterStatus.notify();
            }
        });

        instance.dispatchGlobalEvent("keyboardInit");
        return {
            state: {
                usedKeys,
                letterStatus,
                firstRow: [..."qwertyuiop"],
                secondRow: [..."asdfghjkl"],
                thirdRow: [..."zxcvbnm"],
                alreadyUsed: (usedKeys: string[], key: string): boolean => {
                    return usedKeys.includes(key);
                },
                addInput: (key: string) => {
                    instance.dispatchGlobalEvent("handleKeyInput", key);
                },
                enter: () => {
                    instance.dispatchGlobalEvent("handleEnter");
                },
                backspace: () => {
                    instance.dispatchGlobalEvent("handleBackspace");
                },
                getLetterStatus: (letterStatus: Map<string, number>, key: string) => {
                    return letterStatus.get(key);
                }
            }
        }
    }
});