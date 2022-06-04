import { component } from "elaine";

export default component({
    name: "navigation",
    template: `
    <nav>
        <div>Elaine Wordle</div>
    </nav>
    `,
    css: `
    nav {
        height: 40px;
        width: 100%;
        display: flex;
        background-color: gainsboro;
        border-bottom: 2px solid lightgray;
        box-sizing: border-box;
        position: sticky;
        top: 0;
    }

    div {
        margin: auto;
        font-family: monospaced;
        font-size: 1.5rem;
    }
    `
})