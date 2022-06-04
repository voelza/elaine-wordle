import { component, state, watch } from "elaine";

export default component({
    name: "letter",
    props: [
        {
            name: "letter",
            type: String
        },
        {
            name: "input",
            type: String
        },
        {
            name: "status",
            type: Number
        },
        {
            name: "isRevealed",
            type: Boolean
        },
        {
            name: "index",
            type: Number
        }
    ],
    template: `
    <div class="letter" @@style="@@letterStyle">
        <span>@@{input}</span>
    </div>
    `,
    css: `
    .letter {
        width: 60px;
        height: 60px;
        font-size: 2rem;
        font-family: monospaced;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-transform: capitalize;
        border: 1px solid #e1e1e1;
        border-radius: 5px;
    }
    `,
    setup: (instance) => {
        const statusColors = {
            0: "#83e383",
            1: "#f9f9a3",
            2: "#e3e3e3"
        }

        const letterStyle = state({});

        const setStyle = () => {
            const style: any = {
                //@ts-ignore
                "background-color": statusColors[instance.data.status.value]
            };

            if (instance.data.isRevealed.value) {
                style["animation"] = `flip 0.35s`;
            }

            letterStyle.value = style;
        }

        watch(() => {
            setTimeout(setStyle, 500 + 800 * instance.data.index.value);
        }, instance.data.status, instance.data.isRevealed);
        setStyle();

        return {
            state: {
                letterStyle
            }
        }
    }
})