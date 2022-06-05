import { component, state } from "elaine";
import State from "elaine/dist/states/State";
import Keyboard from "./Keyboard";
import Word from "./Word";
import wordsIKnow from "./words.json";

export default component({
    name: "game",
    template: `
    <div class="game">
        <div @@if="@@result" class="result">
            <div class="result-text">@@{result}</div>
            <div class="result-btns">
                <button ++click="resultToClipboard">Share</button>
                <button ++click="setWord">Play Again</button>
            </div>
        </div>
        <word @@for="word in @@words" word="@@word" isActive="@@isActive(@@usedGuesses, @@_index)" isRevealed="@@isRevealed(@@usedGuesses, @@_index)"></word>
        <keyboard>/keyboard>
    </div>
    `,
    css: `
    .game {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        height: 100%;
        margin-top: 75px;
    }

    .result {
        position: absolute;
        top: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        justify-content: center;
    }

    .result-text {
        font-size: 1.25rem;
    }

    .result-btns {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
    }

    button {
        width: 100px;
    }
    `,
    setup: (instance) => {
        const totalGuesses = 6;
        let theWord: string = "horse";
        const words: State<string[]> = state([]);
        const usedGuesses = state(0);
        const result: State<string | null> = state(null);
        const input: State<string> = state("");
        instance.$store.add({ input });

        let history: string[] = [];
        instance.addGlobalEventListener("historyAdd", (entry: string) => {
            history.push(entry);
        });

        function resultToClipboard() {
            navigator.clipboard.writeText("Elaine Wordle\n" + history.join("\n"))
        }

        let gameOver = false;
        const setWord = () => {
            theWord = wordsIKnow[Math.floor(Math.random() * wordsIKnow.length)];
            usedGuesses.value = 0;
            const nextWords = [];
            for (let i = 0; i < totalGuesses; i++) {
                nextWords.push(theWord);
            }
            words.value = nextWords;
            input.value = "";
            result.value = null;
            gameOver = false;
            history = [];
            instance.dispatchGlobalEvent("reset");
        };
        setWord();

        function handleKeyInput(key: string) {
            if (input.value.length < theWord.length) {
                input.value += key;
            }
        }

        function handleBackspace() {
            if (input.value.length > 0) {
                input.value = input.value.substring(0, input.value.length - 1);
            }
        }

        function handleEnter() {
            if (input.value.length !== theWord.length || gameOver) {
                return;
            }
            instance.dispatchGlobalEvent("enter", input.value);
            usedGuesses.value++;
            if (input.value === theWord) {
                result.value = `You Won! The word was "${theWord.toUpperCase()}".`;
                gameOver = true;
            } else if (usedGuesses.value === totalGuesses) {
                result.value = `You Lost! The word was "${theWord.toUpperCase()}".`;
                gameOver = true;
            } else {
                input.value = "";
            }
        }

        function handleInput(e: KeyboardEvent) {
            if (e.code.startsWith("Key")) {
                handleKeyInput(e.key);
            } else if (e.code === "Backspace") {
                handleBackspace();
            } else if (e.code === "Enter") {
                handleEnter();
            }
        }
        window.addEventListener('keydown', handleInput);

        instance.addGlobalEventListener("handleKeyInput", handleKeyInput);
        instance.addGlobalEventListener("handleBackspace", handleBackspace);
        instance.addGlobalEventListener("handleEnter", handleEnter);
        return {
            state: {
                theWord,
                words,
                usedGuesses,
                result,
                setWord,
                isActive: (guess: number, index: number) => guess === index,
                isRevealed: (guess: number, index: number) => guess > index,
                resultToClipboard
            },
            onDestroyed: () => {
                window.removeEventListener("keydown", handleInput);
            }
        }
    },
    components: [Word, Keyboard]
})