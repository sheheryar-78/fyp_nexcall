const apiKey = "AIzaSyBWtcMRExa5XKTE6n-W0OmXPapgNrIM0U0";

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: {
        parts: [{ text: "Hello world" }],
      },
    }),
  });

  const data = await response.json();
  console.log(data);
}

test().catch(console.error);
