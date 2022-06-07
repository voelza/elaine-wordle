import { component, computed, state } from "elaine";
import State from "elaine/dist/states/State";
import { HistoryEntry } from "./Game";
import Letter from "./Letter";

export default component({
    name: "word",
    props: [
        {
            name: "word",
            type: String
        },
        {
            name: "isActive",
            type: Boolean
        },
        {
            name: "isRevealed",
            type: Boolean
        },
        {
            name: "input",
            type: String
        }
    ],
    template: `
    <div class="word">
        <letter 
                @@for="letter in @@wordArray" 
                letter="@@letter" 
                input="@@getInput(@@input, @@_index)" 
                status="@@getStatus(@@isRevealed, @@_index)" 
                isRevealed="@@isRevealed"
                index="@@_index"
        ></letter>
    </div>`,
    css: `
    .word {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 2px;
    }
    `,
    setup: (instance) => {
        const getStatusWithInput = (isRevealed: boolean, index: number, i: string) => {
            if (!isRevealed) {
                return 2;
            }

            const letter = i[index];
            if (letter === theWord.value[index]) {
                return 0;
            }

            // TODO yellow is hard
            if (theWord.value.indexOf(letter) !== -1) {
                for (let j = 0; j < theWord.value.length; j++) {
                    const c = theWord.value.charAt(j);
                    if (c === letter && i[j] !== c) {
                        return 1;
                    }
                }
            }

            return 2;
        }

        const theWord = instance.data.word;
        const wordArray = computed(() => [...theWord.value], theWord);
        const input: State<string> = state(instance.data.input.value ?? "");

        instance.$store.watch("input", (i) => {
            if (instance.data.isActive.value) {
                input.value = i;
            }
        });

        const getInput = (i: string, index: number) => {
            if (index >= 0 && index < i.length) {
                return i[index];
            }
            return "";
        }

        const getStatus = (isRevealed: boolean, index: number) => {
            return getStatusWithInput(isRevealed, index, input.value);
        }

        instance.addGlobalEventListener("enter", (input: string) => {
            if (!instance.data.isActive.value) {
                return;
            }
            let guesses = "";
            wordArray.value.forEach((_, i) => {
                const status = getStatusWithInput(true, i, input);
                if (status === 2) {
                    guesses += "⬛";
                } else if (status === 1) {
                    guesses += "🟨";
                } else if (status === 0) {
                    guesses += "🟩";
                }
                instance.dispatchGlobalEvent("letterStatus", { letter: input[i], status });
            });
            const historyEntry: HistoryEntry = {
                word: input,
                guesses
            }
            instance.dispatchGlobalEvent("historyAdd", historyEntry);
        });

        instance.addGlobalEventListener("reset", () => {
            input.value = "";
        });

        instance.addGlobalEventListener("keyboardInit", () => {
            if (input.value.length > 0) {
                [...input.value]
                    .forEach((letter, index) => {
                        instance.dispatchGlobalEvent("letterStatus", { letter: letter, status: getStatusWithInput(true, index, input.value) })
                    });
            }
        });
        return {
            state: {
                wordArray,
                getInput,
                input,
                getStatus
            }
        }
    },
    components: [Letter]
});