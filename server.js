const http = require("http");

const server = http.createServer(async (req, res) => {
  // API : /api/redirect?url=...
  if (req.url.startsWith("/api/redirect")) {
    const requestUrl = new URL(req.url, "https://zemn.vercel.app/");
    const target = requestUrl.searchParams.get("url");

    res.setHeader("Content-Type", "application/json");

    if (!target) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        error: "URL manquante"
      }));
      return;
    }

    try {
      const response = await fetch(target, {
        redirect: "follow"
      });

      res.statusCode = 200;

      res.end(JSON.stringify({
        success: true,
        originalUrl: target,
        finalUrl: response.url,
        status: response.status
      }));

    } catch (error) {
      res.statusCode = 500;

      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
    }

    return;
  }

  // Page principale
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  res.end(`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>URL Checker</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 700px;
      margin: 80px auto;
      padding: 20px;
    }

    input {
      width: 70%;
      padding: 12px;
      font-size: 16px;
    }

    button {
      padding: 12px 20px;
      font-size: 16px;
      cursor: pointer;
    }

    #result {
      margin-top: 25px;
      word-break: break-all;
    }
  </style>
</head>

<body>

  <h1>URL Checker</h1>

  <input
    id="url"
    type="url"
    placeholder="https://example.com"
  >

  <button onclick="checkUrl()">
    Vérifier
  </button>

  <div id="result"></div>

  <script>
    async function checkUrl() {
      const input = document.getElementById("url");
      const result = document.getElementById("result");

      const url = input.value.trim();

      if (!url) {
        result.innerHTML = "<p>Entre une URL.</p>";
        return;
      }

      result.innerHTML = "<p>Recherche...</p>";

      try {
        const response = await fetch(
          "/api/redirect?url=" + encodeURIComponent(url)
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Erreur");
        }

        result.innerHTML = \`
          <p><strong>URL originale :</strong></p>
          <p>\${escapeHtml(data.originalUrl)}</p>

          <p><strong>URL finale :</strong></p>
          <p>
            <a
              href="\${escapeHtml(data.finalUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              \${escapeHtml(data.finalUrl)}
            </a>
          </p>

          <p><strong>Status :</strong> \${data.status}</p>
        `;

      } catch (error) {
        result.innerHTML =
          "<p style='color:red'>Erreur : " +
          escapeHtml(error.message) +
          "</p>";
      }
    }

    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  </script>

</body>
</html>
  `);
});

module.exports = server;
