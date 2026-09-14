module.exports = async (req, res) => {
  // Page d'accueil
  if (req.url === "/" || req.url === "") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.end(`
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

  const url = document.getElementById("url").value.trim();
  const result = document.getElementById("result");

  if (!url) {
    result.innerHTML = "Entre une URL.";
    return;
  }

  result.innerHTML = "Recherche...";

  try {

    const response = await fetch(
      "/api?url=" + encodeURIComponent(url)
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur");
    }

    result.innerHTML =
      "<b>URL finale :</b><br><br>" +
      data.finalUrl;

  } catch (error) {

    result.innerHTML =
      "<span style='color:red'>" +
      error.message +
      "</span>";

  }
}
</script>

</body>
</html>
    `);
  }

  // Récupération de l'URL
  const requestUrl = new URL(
    req.url,
    "https://example.com"
  );

  const target = requestUrl.searchParams.get("url");

  res.setHeader("Content-Type", "application/json");

  if (!target) {
    res.statusCode = 400;

    return res.end(JSON.stringify({
      error: "URL manquante"
    }));
  }

  try {

    const parsed = new URL(target);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      throw new Error("Seules les URLs HTTP/HTTPS sont autorisées");
    }

    const response = await fetch(parsed.href, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return res.end(JSON.stringify({
      success: true,
      originalUrl: target,
      finalUrl: response.url,
      status: response.status
    }));

  } catch (error) {

    res.statusCode = 500;

    return res.end(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
};
