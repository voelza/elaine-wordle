import { component, computed, state } from "elaine";
import State from "elaine/dist/states/State";
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
    setup: (setupSate) => {
        const theWord = setupSate.data.word;
        const wordArray = computed(() => [...theWord.value], theWord);
        const input: State<string> = state("");
        setupSate.$store.watch("input", (i) => {
            if (setupSate.data.isActive.value) {
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
            const i = input.value;
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