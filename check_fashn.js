import { Client } from "@gradio/client";

async function check() {
    try {
        const app = await Client.connect("fashn-ai/fashn-vton-1.5");
        const endpoints = await app.view_api();
        console.log(JSON.stringify(endpoints, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();