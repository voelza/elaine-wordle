export type ToastOptions = {
    durationInMs?: number,
    backgroundColor?: string,
    title?: string,
    messageStyle?: string
};

export default function toast(message: string, options: ToastOptions | undefined = undefined) {
    const duration: number = options?.durationInMs ?? 2000;
    const toastElement = document.createElement("div");
    toastElement.setAttribute("style", `position: fixed; top: 15px; left: calc(50% - 125px); width: 250px;  z-index: 500; background-color: ${options?.backgroundColor ?? "#fbf7f7d9"};`);

    const header = document.createElement("div");
    if (options?.title) {
        header.innerText = options.title;
        header.setAttribute("style", "padding: 5px 10px; border-bottom: 1px solid rgba(0,0,0,0.25);");
    }

    const body = document.createElement("div");
    body.innerText = message;
    body.setAttribute("style", options?.messageStyle ? `padding: 10px;${options?.messageStyle}` : "padding: 10px;");

    toastElement.appendChild(header);
    toastElement.appendChild(body);
    document.body.appendChild(toastElement);
    setTimeout(() => toastElement.remove(), duration);
}