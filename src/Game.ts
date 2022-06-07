import { component, state } from "elaine";
import State from "elaine/dist/states/State";
import Keyboard from "./Keyboard";
import toast from "./Toaster";
import Word from "./Word";
import wordsIKnow from "./words.json";

export type HistoryEntry = {
    word: string,
    guesses: string
}

export default component({
    name: "game",
    template: `
    <div class="game">
        <div @@if="@@result" class="result">
            <div class="result-text">@@{result}</div>
            <div class="result-btns">
                Come back tomorrow!
                <button ++click="resultToClipboard">Share ☍</button>
            </div>
        </div>
        <word @@for="word in @@words" 
                word="@@word" 
                isActive="@@isActive(@@usedGuesses, @@_index)" 
                isRevealed="@@isRevealed(@@usedGuesses, @@_index)"
                input="@@getInputFromHistory(@@_index)"
        ></word>
        <keyboard usedKeys="@@getUsedKeys">/keyboard>
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
        const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
        const dayAtMidnightTime = (date: Date) => {
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        }
        const today = new Date();
        const lastSeen = new Date(JSON.parse(localStorage.getItem("wordle-last-seen") ?? JSON.stringify(today)));
        localStorage.setItem("wordle-last-seen", JSON.stringify(today));
        const WORD_INDEX = Math.round((dayAtMidnightTime(today) - dayAtMidnightTime(new Date("2022-06-04T00:00:00"))) / ONE_DAY_IN_MS);

        function saveHistory(h: HistoryEntry[]) {
            localStorage.setItem("wordle-history", JSON.stringify(h));
        }

        function loadHistory(): HistoryEntry[] {
            const history = localStorage.getItem("wordle-history");
            return history ? JSON.parse(history) : [];
        }

        function getInputFromHistory(index: number): string | undefined {
            return history[index]?.word;
        }

        let history: HistoryEntry[] = loadHistory();
        instance.addGlobalEventListener("historyAdd", (entry: HistoryEntry) => {
            history.push(entry);
            saveHistory(history);
        });

        let horseMode = false;
        const totalGuesses = 6;
        let theWord: string = "horse";
        const words: State<string[]> = state([]);
        const usedGuesses = state(history.length);
        const result: State<string | null> = state(null);
        const input: State<string> = state("");
        instance.$store.add({ input });
        function resultToClipboard() {
            const header = horseMode ? "Horsle 🐴\n" : "Worsle 💀\n";
            const squares = horseMode ? history.map(h => [...h.guesses].map(_ => "🟩").join("")).join("\n") : history.map(h => h.guesses).join("\n");
            navigator.clipboard.writeText(header + squares + "\n" + window.location.href);
            toast("Result was saved to clipboard!", { messageStyle: "text-align: center;", backgroundColor: "#aae1b3d9" });
        }

        let gameOver = false;
        theWord = wordsIKnow[WORD_INDEX].toLowerCase();
        const nextWords = [];
        for (let i = 0; i < totalGuesses; i++) {
            nextWords.push(theWord);
        }
        words.value = nextWords;
        const reset = () => {
            history = [];
            saveHistory(history);
            input.value = "";
            result.value = null;
            usedGuesses.value = 0;
            instance.dispatchGlobalEvent("reset");
        };
        if (dayAtMidnightTime(lastSeen) - dayAtMidnightTime(today) !== 0) {
            reset();
        }

        function won() {
            result.value = `You Won! 😎 The word was "${theWord.toUpperCase()}".`;
            gameOver = true;
        }

        function cheater() {
            result.value = `That's right! 🐴 is always right, but the word was "${theWord.toUpperCase()}".`;
            gameOver = true;
            horseMode = true;
        }

        function lost() {
            result.value = `You Lost! 😢 The word was "${theWord.toUpperCase()}".`;
            gameOver = true;
        }

        if (history.length > 0) {
            if (history[history.length - 1].word === theWord) {
                won();
            } else if (history[history.length - 1].word === "horse") {
                cheater();
            } else if (history.length === 6) {
                lost();
            }
        }

        function handleKeyInput(key: string) {
            if (gameOver) {
                return;
            }
            if (input.value.length < theWord.length) {
                input.value += key.toLowerCase();
            }
        }

        function handleBackspace() {
            if (gameOver) {
                return;
            }
            if (input.value.length > 0) {
                input.value = input.value.substring(0, input.value.length - 1);
            }
        }

        function handleEnter() {
            if (input.value.length !== theWord.length || gameOver) {
                return;
            }

            if (!wordsIKnow.some(i => i.toLowerCase() === input.value.toLowerCase())) {
                toast("Word not in list!", { messageStyle: "text-align: center;", backgroundColor: "#e7f385b8" });
                return;
            }

            instance.dispatchGlobalEvent("enter", input.value);
            usedGuesses.value++;
            if (input.value === theWord) {
                won();
            } else if (input.value === "horse") {
                cheater();
            } else if (usedGuesses.value === totalGuesses) {
                lost();
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
                isActive: (guess: number, index: number) => guess === index,
                isRevealed: (guess: number, index: number) => guess > index,
                resultToClipboard,
                getInputFromHistory,
                getUsedKeys: history.map(h => [...h.word]).flatMap(h => Array.from(h))
            },
            onDestroyed: () => {
                window.removeEventListener("keydown", handleInput);
            }
        }
    },
    components: [Word, Keyboard]
})