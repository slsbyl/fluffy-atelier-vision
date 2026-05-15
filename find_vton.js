// using native fetch
async function find() {
    const res = await fetch('https://huggingface.co/api/spaces?search=vton&limit=50');
    const spaces = await res.json();
    for (const s of spaces) {
        if (!s.id) continue;
        try {
            const r = await fetch('https://huggingface.co/api/spaces/' + s.id);
            const d = await r.json();
            if (d.runtime?.stage === 'RUNNING') {
                console.log(s.id + ' is RUNNING');
            }
        } catch (e) {
            // ignore
        }
    }
}
find();