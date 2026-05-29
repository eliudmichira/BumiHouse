const key = 'REDACTED';
async function run() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
        console.log("Available generation models:");
        data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).forEach(m => {
            console.log(m.name);
        });
    } else {
        console.log("Error:", data);
    }
}
run();
