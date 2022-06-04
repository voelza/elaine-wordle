import { component } from "elaine";
import Game from "./Game";
import Navigation from "./Navigation";
export default component({
    name: "app",
    template: `
    <div>
        <navigation></navigation>
        <div class="wordle">
            <game></game>
        </div>
    </div>
    `,
    css: `
    .wordle {
        height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 5px;
    }
    `,
    components: [Navigation, Game]
});