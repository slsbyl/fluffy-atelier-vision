import { Client } from "@gradio/client";

async function check() {
    try {
        const app = await Client.connect("Kwai-Kolors/Kolors-Virtual-Try-On");
        const endpoints = await app.view_api();
        console.log(JSON.stringify(endpoints, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();